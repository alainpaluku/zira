export interface JsonPlaceholderUser {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}

export interface JsonPlaceholderPost {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export interface JsonPlaceholderComment {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
}

const BASE_URL = "https://jsonplaceholder.typicode.com";

/**
 * Service pour consommer l'API publique test https://jsonplaceholder.typicode.com/
 */
export async function fetchTestUsers(): Promise<JsonPlaceholderUser[]> {
  try {
    const res = await fetch(`${BASE_URL}/users`);
    if (!res.ok) throw new Error("Erreur de chargement des utilisateurs JSONPlaceholder");
    return (await res.json()) as JsonPlaceholderUser[];
  } catch (err) {
    console.error("JSONPlaceholder fetchTestUsers failure, using empty fallback:", err);
    return [];
  }
}

export async function fetchTestPosts(): Promise<JsonPlaceholderPost[]> {
  try {
    const res = await fetch(`${BASE_URL}/posts?_limit=10`);
    if (!res.ok) throw new Error("Erreur de chargement des posts JSONPlaceholder");
    return (await res.json()) as JsonPlaceholderPost[];
  } catch (err) {
    console.error("JSONPlaceholder fetchTestPosts failure, using empty fallback:", err);
    return [];
  }
}

export async function fetchTestComments(postId?: number): Promise<JsonPlaceholderComment[]> {
  try {
    const url = postId ? `${BASE_URL}/comments?postId=${postId}` : `${BASE_URL}/comments?_limit=15`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Erreur de chargement des commentaires JSONPlaceholder");
    return (await res.json()) as JsonPlaceholderComment[];
  } catch (err) {
    console.error("JSONPlaceholder fetchTestComments failure, using empty fallback:", err);
    return [];
  }
}
