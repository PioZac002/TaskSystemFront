import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Separator } from "@/components/ui/Separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/AlertDialog";
import { useCommentStore } from "@/store/commentStore";
import { toast } from "@/hooks/use-toast";
import { MessageSquare, Send, Trash2 } from "lucide-react";

function formatDate(dateString) {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toLocaleString("pl-PL", { 
        year: "numeric", 
        month: "2-digit", 
        day: "2-digit", 
        hour: "2-digit", 
        minute: "2-digit" 
    });
}

export function CommentSection({ issueId, currentUserId }) {
    const [newComment, setNewComment] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);
    
    const comments = useCommentStore((state) => state.comments);
    const loading = useCommentStore((state) => state.loading);
    const fetchCommentsByIssueId = useCommentStore((state) => state.fetchCommentsByIssueId);
    const createComment = useCommentStore((state) => state.createComment);
    const deleteComment = useCommentStore((state) => state.deleteComment);

    useEffect(() => {
        if (issueId) {
            fetchCommentsByIssueId(issueId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [issueId]);

    const handleAddComment = async () => {
        if (!newComment.trim()) {
            toast({ 
                title: "Error", 
                description: "Comment cannot be empty", 
                variant: "destructive" 
            });
            return;
        }
        try {
            await createComment({
                issueId,
                content: newComment,
                authorId: currentUserId || 1
            });
            setNewComment("");
            toast({ title: "Success", description: "Comment added successfully" });
        } catch (error) {
            toast({ 
                title: "Error", 
                description: error.message || "Failed to add comment", 
                variant: "destructive" 
            });
        }
    };

    const confirmDeleteComment = (comment) => {
        setCommentToDelete(comment);
        setDeleteDialogOpen(true);
    };

    const handleDeleteComment = async () => {
        if (!commentToDelete) return;
        try {
            await deleteComment(commentToDelete.id);
            toast({ title: "Success", description: "Comment deleted successfully" });
        } catch (error) {
            toast({ 
                title: "Error", 
                description: error.message || "Failed to delete comment", 
                variant: "destructive" 
            });
        } finally {
            setDeleteDialogOpen(false);
            setCommentToDelete(null);
        }
    };

    const getAuthorInitials = (authorId) => {
        return `U${authorId}`;
    };

    const sortedComments = [...comments].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Comments ({comments.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Add Comment Form */}
                    <div className="space-y-3">
                        <Textarea
                            placeholder="Write a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows={3}
                        />
                        <div className="flex justify-end">
                            <Button 
                                onClick={handleAddComment} 
                                disabled={loading || !newComment.trim()}
                                size="sm"
                            >
                                <Send className="h-4 w-4 mr-2" />
                                Add Comment
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    {/* Comments List */}
                    <div className="space-y-4">
                        {sortedComments.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No comments yet. Be the first to comment!
                            </p>
                        ) : (
                            sortedComments.map((comment) => (
                                <div key={comment.id} className="flex gap-3 p-3 rounded-lg hover:bg-accent/50">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                            {getAuthorInitials(comment.authorId)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold">
                                                    User #{comment.authorId}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDate(comment.createdAt)}
                                                </span>
                                            </div>
                                            {currentUserId && currentUserId === comment.authorId && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => confirmDeleteComment(comment)}
                                                    disabled={loading}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this comment? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteComment}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
