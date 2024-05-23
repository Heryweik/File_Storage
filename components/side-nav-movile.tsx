"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileIcon, StarIcon, TrashIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function SideNavMovile() {
  const pathname = usePathname();

  return (
    <div className="w-full flex h-auto md:hidden items-center justify-around bg-white gap-4 fixed z-50 bottom-0 left-0 ">
      <Link href="/dashboard/files">
        <Button
          variant={"link"}
          className={clsx("flex  gap-0", {
            "text-blue-500 border-t-2 border-blue-500 rounded-none": pathname.includes("/dashboard/files"),
          })}
        >
          <FileIcon />
        </Button>
      </Link>

      <Link href="/dashboard/favorites">
        <Button
          variant={"link"}
          className={clsx("flex gap-2", {
            "text-blue-500 border-t-2 border-blue-500 rounded-none": pathname.includes("/dashboard/favorites"),
          })}
        >
          <StarIcon />
        </Button>
      </Link>

      <Link href="/dashboard/trash">
        <Button
          variant={"link"}
          className={clsx("flex gap-2", {
            "text-blue-500 border-t-2 border-blue-500 rounded-none": pathname.includes("/dashboard/trash"),
          })}
        >
          <TrashIcon />
        </Button>
      </Link>
    </div>
  );
}
