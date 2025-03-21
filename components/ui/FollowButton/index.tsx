"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button/Button";

interface FollowButtonProps {
  entityId: string;
  entityType: "TOURNAMENT" | "TEAM" | "PLAYER";
  isFollowing?: boolean;
  className?: string;
}

export default function FollowButton({
  entityId,
  entityType,
  isFollowing: initialIsFollowing = false,
  className,
}: FollowButtonProps) {
  const { data: session, status } = useSession();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async () => {
    if (status !== "authenticated") {
      // Redirect to login page
      window.location.href = `/auth/login?redirect=${window.location.pathname}`;
      return;
    }

    setIsLoading(true);

    try {
      if (isFollowing) {
        // Unfollow
        const response = await fetch(`/api/user/following`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            entityType,
            entityId,
          }),
        });

        if (response.ok) {
          setIsFollowing(false);
        }
      } else {
        // Follow
        const response = await fetch(`/api/user/following`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            entityType,
            entityId,
          }),
        });

        if (response.ok) {
          setIsFollowing(true);
        }
      }
    } catch (error) {
      console.error("Follow action failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isFollowing ? "default" : "outline"}
      size="sm"
      onClick={handleFollow}
      isLoading={isLoading}
      className={className}
    >
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
}