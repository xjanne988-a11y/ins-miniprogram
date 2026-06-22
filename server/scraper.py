import instaloader
import json
import sys
import os

def fetch_instagram_profile(username):
    """Fetch Instagram profile data using instaloader"""
    L = instaloader.Instaloader(
        download_pictures=False,
        download_videos=False,
        download_video_thumbnails=False,
        compress_json=False,
        max_connection_attempts=3,
        request_timeout=30,
    )

    try:
        profile = instaloader.Profile.from_username(L.context, username)

        result = {
            "username": profile.username,
            "full_name": profile.full_name,
            "biography": profile.biography,
            "profile_pic_url": profile.profile_pic_url,
            "followers_count": profile.followers,
            "following_count": profile.followees,
            "media_count": profile.mediacount,
            "is_verified": profile.is_verified,
            "posts": [],
        }

        count = 0
        max_posts = int(os.environ.get("MAX_POSTS", 30))

        for post in profile.get_posts():
            if count >= max_posts:
                break

            result["posts"].append({
                "shortcode": post.shortcode,
                "caption": post.caption if post.caption else "",
                "media_url": post.url if post.url else "",
                "thumbnail_url": post.url if post.typename == "GraphVideo" else post.url,
                "display_url": post.url,
                "media_type": post.typename,
                "likes_count": post.likes,
                "comments_count": post.comments,
                "taken_at": post.date_utc.isoformat(),
                "is_video": post.is_video,
            })
            count += 1

        return json.dumps(result)

    except instaloader.exceptions.ProfileNotExistsException:
        return json.dumps({"error": f"Profile '{username}' does not exist"})
    except instaloader.exceptions.ConnectionException as e:
        return json.dumps({"error": f"Connection error: {str(e)}"})
    except Exception as e:
        return json.dumps({"error": f"Unexpected error: {str(e)}"})

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python scraper.py <username>"}))
        sys.exit(1)

    username = sys.argv[1]
    print(fetch_instagram_profile(username))
