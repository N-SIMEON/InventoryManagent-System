import { redirect } from "next/navigation";

// The signed-out landing route just goes to login for now. Once task 0.8
// (tenant switcher + nav shell) exists, a signed-in visitor here should
// redirect to the tenant dashboard instead.
export default function Home() {
  redirect("/login");
}
