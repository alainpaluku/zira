import appData from "../data.json";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: "FinTech" | "AgriTech" | "GreenTech" | "Investissement" | "Réglementation" | "Entrepreneuriat";
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  publishedAt: string;
  readTime: string;
  image: string;
  featured?: boolean;
  tags: string[];
}

export const BLOG_POSTS: BlogPost[] = (appData.blogPosts as BlogPost[]) || [];

export const CLOUDFLARE_R2_BLOG_URL = "https://assets.zira-invest.cd/blog";

export async function fetchBlogPostsFromR2(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${CLOUDFLARE_R2_BLOG_URL}/posts.json`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {
    // Fallback to local blog posts if R2 offline
  }
  return BLOG_POSTS;
}
