import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCommentStore } from "@/store/commentStore";
import { toast } from "sonner";
import { Trash2, User, ArrowUpDown } from "lucide-react";

function formatDate(dateString) {
    if (!dateString) return "Just now";
    
    try {
        const date = new Date(dateString);
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            return "Invalid date";
        }
        
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        // Just now (< 1 min)
        if (diffMins < 1) return "Just now";
        
        // Minutes ago (< 60 mins)
        if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
        
        // Hours ago (< 24 hours)
        if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
        
        // Days ago (< 7 days)
        if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
        
        // Otherwise show full date
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
    const [currentUserId, setCurrentUserId] = useState(null);
    const [sortOrder, setSortOrder] = useState("newest"); // newest, oldest
    const [filterUserId, setFilterUserId] = useState("all");

    const { comments, fetchCommentsByIssueId, createComment, deleteComment, loading } = useCommentStore();

    useEffect(() => {
        if (issueId) {
            fetchCommentsByIssueId(issueId);
        }

        // Pobierz userId z localStorage
        const userId = localStorage.getItem('userId');
        if (userId) {
            setCurrentUserId(Number(userId));
        }
    }, [issueId]);

    const handleAddComment = async () => {
        if (!newComment.trim()) {
            toast.error("Comment cannot be empty");
            return;
        }

        if (! currentUserId) {
            toast.error("You must be logged in to comment");
            return;
        }

        try {
            await createComment({
                issueId: Number(issueId),
                content: newComment. trim(),
                authorId: currentUserId  // ← Z localStorage!
            });

            toast.success("Comment added successfully!");
            setNewComment("");

            // Odśwież komentarze
            await fetchCommentsByIssueId(issueId);
        } catch (error) {
            const errorMessage = error.response?.data?.Message || error.message || "Failed to add comment";
            toast.error(errorMessage);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (! window.confirm("Are you sure you want to delete this comment?")) return;

        try {
            await deleteComment(commentId);
            toast. success("Comment deleted successfully!");
            await fetchCommentsByIssueId(issueId);
        } catch (error) {
            const errorMessage = error.response?.data?.Message || error.message || "Failed to delete comment";
            toast.error(errorMessage);
        }
    };

    // Filtrowanie i sortowanie
    let filteredComments = [... comments];

    // Filtruj po użytkowniku
    if (filterUserId !== "all") {
        filteredComments = filteredComments.filter(c => String(c.authorId) === filterUserId);
    }

    // Sortuj
    filteredComments.sort((a, b) => {
        const dateA = new Date(a. createdAt);
        const dateB = new Date(b.createdAt);
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    // Unikalni autorzy dla filtra
    const uniqueAuthors = [... new Set(comments.map(c => c.authorId))];

    return (
        <div className="space-y-4">
            {/* Filtry */}
            {comments.length > 0 && (
                <div className="flex gap-3">
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filterUserId} onValueChange={setFilterUserId}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Users</SelectItem>
                            {uniqueAuthors.map(authorId => (
                                <SelectItem key={authorId} value={String(authorId)}>
                                    User #{authorId}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Formularz dodawania komentarza */}
            <Card className="bg-accent/50">
                <CardContent className="pt-6">
                    <div className="space-y-3">
                        <Textarea
                            placeholder="Write a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e. target.value)}
                            rows={3}
                            className="resize-none"
                        />
                        <div className="flex justify-between items-center">
                            <p className="text-xs text-muted-foreground">
                                {currentUserId ? `Posting as User #${currentUserId}` : 'Not logged in'}
                            </p>
                            <Button
                                onClick={handleAddComment}
                                disabled={loading || !newComment.trim() || !currentUserId}
                            >
                                Add Comment
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

                {! loading && comments.length === 0 && (
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
                            <p className="text-muted-foreground">
                                No comments match your filters
                            </p>
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
                                            <p className="font-medium">User #{comment.authorId}</p>
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