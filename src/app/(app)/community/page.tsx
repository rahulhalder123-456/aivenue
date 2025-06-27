
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  doc,
  deleteDoc,
  updateDoc,
  increment,
  runTransaction,
  Timestamp,
  limit,
  startAfter,
  getDocs,
  getDoc,
} from "firebase/firestore";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Heart,
  MessageCircle,
  Send,
  Trash2,
  MoreHorizontal,
  Loader2,
  ImagePlus,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// --- INTERFACES ---
interface Post {
  id: string;
  userId: string;
  userName: string;
  userPhotoURL: string | null;
  content: string;
  createdAt: Timestamp;
  likeCount: number;
  likedBy: string[];
  commentCount: number;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userPhotoURL: string | null;
  content: string;
  createdAt: Timestamp;
}

const POSTS_PER_PAGE = 5;

// --- MAIN PAGE COMPONENT ---
export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  
  const [newPostContent, setNewPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const { toast } = useToast();
  const [newPostFile, setNewPostFile] = useState<File | null>(null);
  const [newPostFilePreview, setNewPostFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPosts = useCallback(async () => {
    if (!db) return;
    setLoading(true);
    try {
      const first = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        limit(POSTS_PER_PAGE)
      );
      const documentSnapshots = await getDocs(first);

      const newPosts = documentSnapshots.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Post)
      );
      setPosts(newPosts);
      
      const lastDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];
      setLastVisible(lastDoc);

      setHasMore(documentSnapshots.docs.length === POSTS_PER_PAGE);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({ title: "Error", description: "Could not fetch posts.", variant: "destructive" });
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    if(user) {
        fetchPosts();
    }
  }, [user, fetchPosts]);

  const fetchMorePosts = async () => {
    if (!db || !lastVisible) return;
    setLoadingMore(true);
    try {
        const next = query(
            collection(db, "posts"),
            orderBy("createdAt", "desc"),
            startAfter(lastVisible),
            limit(POSTS_PER_PAGE)
        );
        const documentSnapshots = await getDocs(next);

        const newPosts = documentSnapshots.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as Post)
        );

        setPosts(prevPosts => [...prevPosts, ...newPosts]);

        const lastDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];
        setLastVisible(lastDoc);

        setHasMore(documentSnapshots.docs.length === POSTS_PER_PAGE);
    } catch (error) {
        console.error("Error fetching more posts:", error);
        toast({ title: "Error", description: "Could not fetch more posts.", variant: "destructive" });
    }
    setLoadingMore(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast({ title: "Invalid File Type", description: "Please select an image or video file.", variant: "destructive" });
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ title: "File Too Large", description: "Please select a file smaller than 5MB.", variant: "destructive" });
        return;
      }
      setNewPostFile(file);
      setNewPostFilePreview(URL.createObjectURL(file));
    }
  };

  const clearFileSelection = () => {
    setNewPostFile(null);
    if (newPostFilePreview) {
      URL.revokeObjectURL(newPostFilePreview);
    }
    setNewPostFilePreview(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;
     if (newPostContent.trim() === "" && !newPostFile) {
        toast({ title: "Cannot create an empty post.", variant: "destructive" });
        return;
    }

    setIsPosting(true);
    try {
      let mediaUrl: string | undefined = undefined;
      let mediaType: 'image' | 'video' | undefined = undefined;

      if (newPostFile) {
        mediaType = newPostFile.type.startsWith('image/') ? 'image' : 'video';
        mediaUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(newPostFile);
        });
      }

      const newPostDataForDb = {
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        userPhotoURL: user.photoURL,
        content: newPostContent,
        createdAt: serverTimestamp(),
        likeCount: 0,
        likedBy: [],
        commentCount: 0,
        ...(mediaUrl && { mediaUrl }),
        ...(mediaType && { mediaType }),
      };
      
      const postRef = await addDoc(collection(db, "posts"), newPostDataForDb);
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
          setPosts(prev => [{id: postSnap.id, ...postSnap.data()} as Post, ...prev]);
      }
      
      setNewPostContent("");
      clearFileSelection();

    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Could not create post. The file might be too large.",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };


  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      <header>
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Community Hub
        </h2>
        <p className="text-muted-foreground">
          Connect with fellow learners, ask questions, and share your progress.
        </p>
      </header>

      <main className="max-w-3xl mx-auto">
        {user && (
          <Card className="mb-6">
            <form onSubmit={handleCreatePost}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={user.photoURL || undefined} />
                    <AvatarFallback>
                      {user.displayName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <Textarea
                    placeholder="What's on your mind?"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="min-h-[80px]"
                    disabled={isPosting}
                  />
                </div>
                 {newPostFilePreview && (
                    <div className="relative mt-4 ml-14">
                        <div className="rounded-lg overflow-hidden border max-w-sm">
                            {newPostFile?.type.startsWith('image/') ? (
                                <img src={newPostFilePreview} alt="Preview" className="w-full h-auto" />
                            ) : (
                                <video src={newPostFilePreview} controls className="w-full h-auto" />
                            )}
                        </div>
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-7 w-7"
                            onClick={clearFileSelection}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
              </CardContent>
              <CardFooter className="justify-end flex items-center gap-2">
                 <Button variant="ghost" size="icon" asChild>
                    <Label htmlFor="post-file" className="cursor-pointer text-muted-foreground hover:text-primary">
                        <ImagePlus className="h-5 w-5" />
                        <span className="sr-only">Add media</span>
                    </Label>
                </Button>
                <Input id="post-file" name="post-file" type="file" className="hidden" accept="image/*,video/*" onChange={handleFileChange} ref={fileInputRef} disabled={isPosting} />
                <Button
                  type="submit"
                  disabled={isPosting || (newPostContent.trim() === "" && !newPostFile)}
                >
                  {isPosting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Post
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        <div className="space-y-4">
          {loading ? (
            <>
              <PostSkeleton />
              <PostSkeleton />
            </>
          ) : posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} onDelete={handleDeletePost} />)
          ) : (
            <Card className="text-center p-8">
              <p className="text-muted-foreground">
                No posts yet. Be the first to share something!
              </p>
            </Card>
          )}

          {loadingMore && <PostSkeleton />}
          
          {hasMore && !loading && !loadingMore && (
              <div className="text-center">
                  <Button onClick={fetchMorePosts} variant="outline">
                      Load More
                  </Button>
              </div>
          )}
        </div>
      </main>
    </div>
  );
}

// --- POST CARD COMPONENT ---
const PostCard = React.memo(function PostCard({ post, onDelete }: { post: Post; onDelete: (postId: string) => void; }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showComments, setShowComments] = useState(false);

  const isOwner = user?.uid === post.userId;
  const [isLiked, setIsLiked] = useState(user ? post.likedBy?.includes(user.uid) : false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);

  const handleLike = async () => {
    if (!user || !db) {
        toast({ title: "Please log in to like posts.", variant: "destructive" });
        return;
    }
    
    // Optimistic UI update
    const originalLiked = isLiked;
    setIsLiked(prev => !prev);
    setLikeCount(prev => (originalLiked ? prev - 1 : prev + 1));
    
    const postRef = doc(db, "posts", post.id);
    try {
      await runTransaction(db, async (transaction) => {
        const postDoc = await transaction.get(postRef);
        if (!postDoc.exists()) throw "Document does not exist!";

        const currentLikedBy = postDoc.data().likedBy || [];
        const userHasLiked = currentLikedBy.includes(user.uid);

        transaction.update(postRef, {
          likeCount: increment(userHasLiked ? -1 : 1),
          likedBy: userHasLiked
            ? currentLikedBy.filter((uid: string) => uid !== user.uid)
            : [...currentLikedBy, user.uid],
        });
      });
    } catch (error) {
      // Revert on failure
      setIsLiked(originalLiked);
      setLikeCount(prev => (originalLiked ? prev + 1 : prev - 1));
      console.error("Error liking post:", error);
      toast({
        title: "Error",
        description: "Could not update like.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!isOwner || !db) return;
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deleteDoc(doc(db, "posts", post.id));
        onDelete(post.id); // Notify parent to remove from UI
        toast({ title: "Success", description: "Post deleted." });
      } catch (error) {
        console.error("Error deleting post:", error);
        toast({
          title: "Error",
          description: "Could not delete post.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={post.userPhotoURL || undefined} />
            <AvatarFallback>{post.userName?.charAt(0) || "A"}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{post.userName}</p>
            <p className="text-xs text-muted-foreground">
              {post.createdAt
                ? formatDistanceToNow(post.createdAt.toDate(), {
                    addSuffix: true,
                  })
                : "just now"}
            </p>
          </div>
        </div>
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent className="px-4 pb-2">
        {post.content && <p className="whitespace-pre-wrap">{post.content}</p>}
         {post.mediaUrl && (
            <div className={`rounded-lg overflow-hidden border ${post.content ? 'mt-4' : ''}`}>
                {post.mediaType === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.mediaUrl} alt="Post content" className="w-full h-auto" />
                ) : post.mediaType === 'video' ? (
                    <video src={post.mediaUrl} controls className="w-full h-auto bg-black" />
                ) : null}
            </div>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t flex justify-between">
        <div className="flex gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className="flex items-center gap-2"
          >
            <Heart
              className={`h-4 w-4 ${
                isLiked ? "text-red-500 fill-current" : ""
              }`}
            />
            <span>{likeCount}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{commentCount}</span>
          </Button>
        </div>
      </CardFooter>
      {showComments && <CommentSection postId={post.id} onCommentAdded={() => setCommentCount(c => c+1)} />}
    </Card>
  );
});
PostCard.displayName = "PostCard";


// --- COMMENT SECTION COMPONENT ---
function CommentSection({ postId, onCommentAdded }: { postId: string; onCommentAdded: () => void; }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;
    const q = query(
      collection(db, "posts", postId, "comments"),
      orderBy("createdAt", "asc")
    );

    getDocs(q).then(snapshot => {
        const commentsData = snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as Comment)
        );
        setComments(commentsData);
        setLoading(false);
    });
    // We only fetch comments once when the section is opened to improve performance
    // For real-time, we would use onSnapshot here.
  }, [postId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || newComment.trim() === "") return;

    setIsCommenting(true);
    const postRef = doc(db, "posts", postId);
    const commentsRef = collection(postRef, "comments");

    try {
      const newCommentData = {
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        userPhotoURL: user.photoURL,
        content: newComment,
        createdAt: serverTimestamp(),
      }
      const commentRef = await addDoc(commentsRef, newCommentData);
      
      // Optimistic UI update for the new comment
      const newCommentForState = {
          ...newCommentData,
          id: commentRef.id,
          createdAt: new Timestamp(Date.now() / 1000, 0), // approximate timestamp
      }
      setComments(prev => [...prev, newCommentForState]);

      await updateDoc(postRef, { commentCount: increment(1) });
      onCommentAdded();
      setNewComment("");

    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Could not add comment.",
        variant: "destructive",
      });
    } finally {
      setIsCommenting(false);
    }
  };

  return (
    <div className="p-4 border-t">
      {user && (
        <form onSubmit={handleAddComment} className="flex items-center gap-2 mb-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.photoURL || undefined} />
            <AvatarFallback>
              {user.displayName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <Input
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={isCommenting}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isCommenting || newComment.trim() === ""}
          >
            {isCommenting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      )}
      <div className="space-y-4">
        {loading ? <Skeleton className="h-10 w-full" /> : 
        comments.map((comment) => (
          <div key={comment.id} className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.userPhotoURL || undefined} />
              <AvatarFallback>
                {comment.userName?.charAt(0) || "A"}
              </AvatarFallback>
            </Avatar>
            <div className="bg-secondary p-3 rounded-lg w-full">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm">{comment.userName}</p>
                <p className="text-xs text-muted-foreground">
                  {comment.createdAt
                    ? formatDistanceToNow(comment.createdAt.toDate(), {
                        addSuffix: true,
                      })
                    : ""}
                </p>
              </div>
              <p className="text-sm mt-1">{comment.content}</p>
            </div>
          </div>
        ))}
         {!loading && comments.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">No comments yet.</p>
        )}
      </div>
    </div>
  );
}

// --- SKELETON COMPONENT ---
function PostSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 p-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-3 w-[100px]" />
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-2 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
         <Skeleton className="h-64 w-full" />
      </CardContent>
      <CardFooter className="p-4 border-t flex justify-between">
        <div className="flex gap-4">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
        </div>
      </CardFooter>
    </Card>
  );
}

    