'use client'


import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileIcon, StarIcon, TrashIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function SideNav() {

    const pathname = usePathname();

  return (
    <div className="w-40 hidden md:flex flex-col gap-4 fixed ">
      <Link href="/dashboard/files">
        <Button variant={"link"} className={clsx("flex gap-2", {
            'text-blue-500': pathname.includes('/dashboard/files')
        })}>
          <FileIcon /> All Files
        </Button>
      </Link>

      <Link href="/dashboard/favorites">
        <Button variant={"link"} className={clsx("flex gap-2", {
            'text-blue-500': pathname.includes('/dashboard/favorites')
        })}>
          <StarIcon /> Favorites
        </Button>
      </Link>

      <Link href="/dashboard/trash">
        <Button variant={"link"} className={clsx("flex gap-2", {
            'text-blue-500': pathname.includes('/dashboard/trash')
        })}>
          <TrashIcon /> Trash
        </Button>
      </Link>
    </div>
  );
}
