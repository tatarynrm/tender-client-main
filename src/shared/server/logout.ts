'use server'

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function handleServerLogout() {
  const cookieStore = await cookies();
  
  // 1. Викликаємо бекенд, щоб він вбив сесію в Redis
  const sessionId = cookieStore.get("centrifuge")?.value;
  if (sessionId) {
    await fetch(`${process.env.SERVER_URL}/auth/logout`, {
      method: 'POST', // або GET, залежно від твого NestJS
      headers: { Cookie: `centrifuge=${sessionId}` },
    });
  }

  // 2. Видаляємо куку на рівні Next.js (це спрацює для браузера)
//   cookieStore.delete('centrifuge');
  
  // 3. Відправляємо на логін
  redirect('/auth/login');
}