import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Separator } from "@/components/ui/Separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { useCommentStore } from "@/store/commentStore";
import { useAuthStore } from "@/store/authStore";
import { useUserStore } from "@/store/userStore";
import { storageService } from "@/services/storageService";
import { fileService } from "@/services/fileService";
import { toast } from "sonner";
import { Trash2, User, Paperclip, X, ImageIcon } from "lucide-react";

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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

function AttachmentThumbnail({ fileId, canDelete, onDelete }) {
    const [blobUrl, setBlobUrl] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        let url = null;
        fileService.fetchFileBlob(fileId)
            .then(u => {
                url = u;
                setBlobUrl(u);
            })
            .catch(() => setError(true));

        return () => {
            if (url) URL.revokeObjectURL(url);
        };
    }, [fileId]);

    if (error) {
        return (
            <div className="relative w-20 h-20 rounded-md border border-border bg-muted flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="relative w-20 h-20 rounded-md overflow-hidden border border-border group">
            {blobUrl ? (
                <img
                    src={blobUrl}
                    alt={`Attachment ${fileId}`}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full bg-muted animate-pulse" />
            )}
            {canDelete && (
                <button
                    onClick={() => onDelete(fileId)}
                    className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete attachment"
                >
                    <X className="h-3 w-3" />
                </button>
            )}
        </div>
    );
}

export function CommentSection({ issueId }) {
    const [newComment, setNewComment] = useState("");
    const [sortOrder, setSortOrder] = useState("newest");
    const [filterUserId, setFilterUserId] = useState("all");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pendingFiles, setPendingFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Pobierz userId z authStore zamiast localStorage
    const user = useAuthStore((state) => state.user);
    const currentUserId = user?.id || null;

    const { comments, fetchCommentsByIssueId, createComment, deleteComment, uploadAttachment, deleteAttachment, loading } = useCommentStore();
    const { users, fetchUsers } = useUserStore();

    useEffect(() => {
        if (issueId) {
            fetchCommentsByIssueId(issueId);
            fetchUsers();
        }
    }, [issueId, fetchCommentsByIssueId, fetchUsers]);
    
    // Helper function to get user name by ID (fallback when authorName not available)
    const getUserName = (userId) => {
        if (!userId) return "Unknown User";
        const foundUser = users.find(u => u.id === userId);
        if (foundUser) {
            return `${foundUser.firstName || ''} ${foundUser.lastName || ''}`.trim() || `User #${userId}`;
        }
        return `User #${userId}`;
    };

    const getCommentAuthorName = (comment) => {
        if (comment.authorName) return comment.authorName;
        return getUserName(comment.authorId);
    };

    const validateFile = (file) => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            toast.error(`File type not allowed. Use JPG, PNG, or WebP.`);
            return false;
        }
        if (file.size > MAX_FILE_SIZE) {
            toast.error(`File too large. Maximum size is 10MB.`);
            return false;
        }
        return true;
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files || []);
        const valid = files.filter(validateFile);
        if (valid.length > 0) {
            setPendingFiles(prev => [...prev, ...valid]);
        }
        // Reset input so the same file can be selected again
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removePendingFile = (index) => {
        setPendingFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) {
            toast.error("Comment cannot be empty");
            return;
        }
        
        if (isSubmitting) return;

        // Spróbuj pobrać userId z różnych źródeł
        let authorId = currentUserId;

        if (!authorId) {
            const storedUserId = storageService.getItem('userId');
            if (storedUserId) {
                authorId = Number(storedUserId);
            }
        }

        if (!authorId) {
            const userStr = storageService.getItem('user');
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
            return;
        }

        setIsSubmitting(true);
        try {
            const createdComment = await createComment({
                issueId: Number(issueId),
                content: newComment.trim(),
                authorId: Number(authorId)
            });

            // Upload pending files to the newly created comment
            if (pendingFiles.length > 0 && createdComment?.id) {
                setIsUploading(true);
                for (const file of pendingFiles) {
                    try {
                        await uploadAttachment(file, createdComment.id);
                    } catch (uploadErr) {
                        console.error('Error uploading file:', uploadErr);
                        toast.error(`Failed to upload ${file.name}`);
                    }
                }
                setIsUploading(false);
                setPendingFiles([]);
            }

            toast.success("Comment added successfully!");
            setNewComment("");
        } catch (error) {
            const errorMessage = error.response?.data?.Message || error.message || "Failed to add comment";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
            setIsUploading(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;

        try {
            await deleteComment(commentId);
            toast.success("Comment deleted successfully!");
        } catch (error) {
            const errorMessage = error.response?.data?.Message || error.message || "Failed to delete comment";
            toast.error(errorMessage);
        }
    };

    const handleDeleteAttachment = async (fileId, commentId) => {
        if (!window.confirm("Delete this attachment?")) return;
        try {
            await deleteAttachment(fileId, commentId);
            toast.success("Attachment deleted.");
        } catch (attachErr) {
            console.error('Error deleting attachment:', attachErr);
            toast.error("Failed to delete attachment.");
        }
    };

    // Filtrowanie i sortowanie
    let filteredComments = [...comments];

    if (filterUserId !== "all") {
        filteredComments = filteredComments.filter(c => String(c.authorId) === filterUserId);
    }

    filteredComments.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    const uniqueAuthors = [...new Set(comments.map(c => c.authorId))];

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

                        {/* Pending file list */}
                        {pendingFiles.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {pendingFiles.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-1 bg-muted rounded px-2 py-1 text-sm">
                                        <Paperclip className="h-3 w-3" />
                                        <span className="max-w-[120px] truncate">{file.name}</span>
                                        <button onClick={() => removePendingFile(idx)} className="ml-1 text-muted-foreground hover:text-destructive">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-between items-center">
                            <div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={loading || isSubmitting}
                                >
                                    <Paperclip className="h-4 w-4 mr-1" />
                                    Attach Image
                                </Button>
                            </div>
                            <Button
                                onClick={handleAddComment}
                                disabled={loading || isSubmitting || isUploading || !newComment.trim()}
                            >
                                {isUploading ? "Uploading..." : isSubmitting ? "Adding..." : "Add Comment"}
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
                                            <p className="font-medium">{getCommentAuthorName(comment)}</p>
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

                                    {/* Attachments */}
                                    {comment.attachmentIds && comment.attachmentIds.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {comment.attachmentIds.map(fileId => (
                                                <AttachmentThumbnail
                                                    key={fileId}
                                                    fileId={fileId}
                                                    canDelete={currentUserId === comment.authorId}
                                                    onDelete={(id) => handleDeleteAttachment(id, comment.id)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
