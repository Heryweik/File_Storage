import {
  OrganizationSwitcher,
  SignIn,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useSession,
} from "@clerk/nextjs";
import { Button } from "./ui/button";
import Image from "next/image";
import Link from "next/link";
import { FileIcon } from "lucide-react";

export default function Header() {
  return (
    <div className="border-b py-2 md:py-4 bg-gray-50 z-10 fixed w-full">
      <div className="md:container px-2 mx-auto flex justify-between items-center text-gray-800">
        <Link href={"/"} className="flex gap-2 items-center text-xl">
          <Image src="/logo.png" width={40} height={30} alt="File Drive" />
          <span className="hidden md:block">File Drive</span>
        </Link>

        <SignedIn>
          <Button variant={"outline"}  className="hidden md:block">
            <Link href={"/dashboard/files"}>
              <span>Your Files</span>
            </Link>
          </Button>
          <Button variant={"outline"} size={'icon'}  className="flex md:hidden">
            <Link href={"/dashboard/files"}>
              <FileIcon className="h-5 w-5 " />
            </Link>
          </Button>
        </SignedIn>
        <div className="flex items-center justify-center gap-x-2">
          <div className="pt-2">

          <OrganizationSwitcher  />
          </div>
          <UserButton />
          <SignedOut>
            <SignInButton>
              <Button>Sign In</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </div>
  );
}
