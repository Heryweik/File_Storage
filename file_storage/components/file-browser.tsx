
"use client";

import FileCard from "@/components/file-card";
import SearchBar from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import UploadButton from "@/components/upload-button";
import { api } from "@/convex/_generated/api";
import {
  SignInButton,
  SignOutButton,
  SignedIn,
  SignedOut,
  useOrganization,
  useUser,
} from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { FileIcon, Loader2, StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

function Placeholder({ orgId }: { orgId: string | undefined }) {
  return (
    <div className="flex flex-col gap-6 w-full items-center mt-20">
      <Image
        src="/empty.svg"
        alt="Image of a file folder"
        width={300}
        height={300}
      />
      <div className="text-2xl">You have no files, upload one now!</div>

      <UploadButton orgId={orgId} />
    </div>
  );
}

interface FileBrowserProps {
  title: string;
  favorite?: boolean;
}

export function FileBrowser({ title, favorite }: FileBrowserProps) {
  // clerk nos da la organización actual y el usuario
  const organization = useOrganization();
  const user = useUser();
  const [query, setQuery] = useState("");

  let orgId = undefined;
  // Si la organización y el usuario están cargados, entonces el orgId es el id de la organización, si no, es el id del usuario, el ?? es para que si no hay organización, se use el id del usuario
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization?.organization?.id ?? user?.user?.id;
  }

  // Le decimos que queremos los archivos de la organización actual, esto va en base al args de la query en el archivo convex/files.ts
  const files = useQuery(api.files.getFiles, orgId ? { orgId, query, favorites: favorite } : "skip");
  const isLoading = files === undefined;


  return (

        <div >
          {isLoading && (
            <div className="flex flex-col gap-6 w-full items-center mt-20">
              <Loader2 className="h-32 w-32 animate-spin text-gray-500" />
              <div className="text-2xl">Loading...</div>
            </div>
          )}

          {!isLoading && (
            <>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">{title}</h1>

                <SearchBar query={query} setQuery={setQuery} />
                <UploadButton orgId={orgId} />
              </div>

              {files.length === 0 && <Placeholder orgId={orgId} />}

              <div className="grid  md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
                {files?.map((file) => <FileCard key={file._id} file={file} />)}
              </div>
            </>
          )}
        </div>
  );
}
