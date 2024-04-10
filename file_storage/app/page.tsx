"use client";

import FileCard from "@/components/file-card";
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


export default function Home() {
  

  // clerk nos da la organización actual y el usuario
  const organization = useOrganization();
  const user = useUser();

  let orgId = undefined;
  // Si la organización y el usuario están cargados, entonces el orgId es el id de la organización, si no, es el id del usuario, el ?? es para que si no hay organización, se use el id del usuario
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization?.organization?.id ?? user?.user?.id;
  }

  // Le decimos que queremos los archivos de la organización actual, esto va en base al args de la query en el archivo convex/files.ts
  const files = useQuery(api.files.getFiles, orgId ? { orgId } : "skip");
  

  return (
    <main className="container mx-auto pt-12">
      {/* <SignedIn>
        <SignOutButton>
          <Button>Sign Out</Button>
        </SignOutButton>
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
      <Button>Sign In</Button>
      </SignInButton>
      </SignedOut> */}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Your Files</h1>

        <UploadButton orgId={orgId}/>
      </div>

      <div className="grid  md:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-4">
      {files?.map((file) => <FileCard key={file._id} file={file} />)}

      </div>
    </main>
  );
}
