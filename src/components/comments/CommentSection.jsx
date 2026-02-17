import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Separator } from "@/components/ui/Separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { useCommentStore } from "@/store/commentStore";
import { useAuthStore } from "@/store/authStore";
import { useUserStore } from "@/store/userStore";
import { toast } from "sonner";
import { Trash2, User } from "lucide-react";

function formatDate(dateString) {
    if (!dateString) return "";

    try {
        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            return "Invalid date";
        }
        
        // Handle default/unset dates (0001-01-01T00:00:00)
        if (dateString.startsWith("0001-01-01")) {
            return "Just now";
        }

        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return "Invalid date";
    }
}

export function CommentSection({ issueId }) {
    const [newComment, setNewComment] = useState("");
    const [sortOrder, setSortOrder] = useState("newest");
    const [filterUserId, setFilterUserId] = useState("all");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pobierz userId z authStore zamiast localStorage
    const user = useAuthStore((state) => state.user);
    const currentUserId = user?.id || null;

    const { comments, fetchCommentsByIssueId, createComment, deleteComment, loading } = useCommentStore();
    const { users, fetchUsers } = useUserStore();

    useEffect(() => {
        if (issueId) {
            fetchCommentsByIssueId(issueId);
            fetchUsers();
        }

        // Debug log
        console.log('🔍 [CommentSection] Current user:', {
            user,
            currentUserId,
            issueId
        });
    }, [issueId, fetchCommentsByIssueId, fetchUsers, user, currentUserId]);
    
    // Helper function to get user name by ID
    const getUserName = (userId) => {
        if (!userId) return "Unknown User";
        const foundUser = users.find(u => u.id === userId);
        if (foundUser) {
            return `${foundUser.firstName || ''} ${foundUser.lastName || ''}`.trim() || `User #${userId}`;
        }
        return `User #${userId}`;
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) {
            toast.error("Comment cannot be empty");
            return;
        }
        
        // Prevent double submission
        if (isSubmitting) {
            return;
        }

        // Spróbuj pobrać userId z różnych źródeł
        let authorId = currentUserId;

        if (!authorId) {
            // Fallback 1: localStorage userId
            const storedUserId = localStorage.getItem('userId');
            if (storedUserId) {
                authorId = Number(storedUserId);
            }
        }

        if (!authorId) {
            // Fallback 2: user object z localStorage
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const userObj = JSON.parse(userStr);
                    authorId = userObj.id;
                } catch (e) {
                    console.error('Error parsing user:', e);
                }
            }
        }

        if (!authorId) {
            toast.error("Unable to identify user. Please try logging in again.");
            console.error('❌ Cannot add comment - no valid authorId found');
            return;
        }

        console.log('📤 [CommentSection] Sending comment:', {
            issueId: Number(issueId),
            content: newComment.trim(),
            authorId
        });

        setIsSubmitting(true);
        try {
            await createComment({
                issueId: Number(issueId),
                content: newComment.trim(),
                authorId: Number(authorId)
            });

            toast.success("Comment added successfully!");
            setNewComment("");
            // Don't refetch - the store already updates with the response
        } catch (error) {
            const errorMessage = error.response?.data?.Message || error.message || "Failed to add comment";
            console.error('❌ [CommentSection] Failed to add comment:', {
                error,
                response: error.response?.data,
                status: error.response?.status
            });
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;

        try {
            await deleteComment(commentId);
            toast.success("Comment deleted successfully!");
            // Don't refetch - the store already updates
        } catch (error) {
            const errorMessage = error.response?.data?.Message || error.message || "Failed to delete comment";
            toast.error(errorMessage);
        }
    };

    // Filtrowanie i sortowanie
    let filteredComments = [... comments];

    if (filterUserId !== "all") {
        filteredComments = filteredComments.filter(c => String(c.authorId) === filterUserId);
    }

    filteredComments. sort((a, b) => {
        const dateA = new Date(a. createdAt);
        const dateB = new Date(b.createdAt);
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    const uniqueAuthors = [... new Set(comments.map(c => c.authorId))];

    return (
        <div className="space-y-4">
            {/* Filtry */}
            {comments.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3">
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filterUserId} onValueChange={setFilterUserId}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Users</SelectItem>
                            {uniqueAuthors.map(authorId => (
                                <SelectItem key={authorId} value={String(authorId)}>
                                    {getUserName(authorId)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Formularz dodawania */}
            <Card className="bg-accent/50">
                <CardContent className="pt-6">
                    <div className="space-y-3">
                        <Textarea
                            placeholder="Write a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows={3}
                            className="resize-none"
                            disabled={loading || isSubmitting}
                        />
                        <div className="flex justify-end items-center">
                            <Button
                                onClick={handleAddComment}
                                disabled={loading || !newComment.trim()}
                            >
                                {loading ? "Adding..." : "Add Comment"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Lista komentarzy */}
            <div className="space-y-3">
                {loading && comments.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">Loading comments...</p>
                    </div>
                )}

                {!loading && comments.length === 0 && (
                    <Card className="bg-muted/30">
                        <CardContent className="py-12 text-center">
                            <User className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                            <p className="text-muted-foreground">
                                No comments yet. Be the first to comment!
                            </p>
                        </CardContent>
                    </Card>
                )}

                {!loading && filteredComments.length === 0 && comments.length > 0 && (
                    <Card className="bg-muted/30">
                        <CardContent className="py-8 text-center">
                            <p className="text-muted-foreground">No comments match your filters</p>
                        </CardContent>
                    </Card>
                )}

                {filteredComments.map((comment) => (
                    <Card key={comment.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-4">
                            <div className="flex gap-3">
                                <Avatar className="h-10 w-10 bg-primary/10">
                                    <AvatarFallback className="bg-primary/20 text-primary">
                                        <User className="h-5 w-5" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <p className="font-medium">{getUserName(comment.authorId)}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(comment.createdAt)}
                                            </p>
                                        </div>
                                        {currentUserId === comment.authorId && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteComment(comment.id)}
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                    <Separator className="my-2" />
                                    <p className="text-sm whitespace-pre-wrap break-words">
                                        {comment.content}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}