import Button from "@/components/ui/Button";
import { db } from "@/lib/db";

export default async function Home() {
  await db.set("hello", "hello");
  return (
    <div>
      <p>Hello World!</p>
      <Button>Click Me!</Button>
    </div>
  );
}
