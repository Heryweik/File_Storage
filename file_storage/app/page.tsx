"use client";

import ModalFile from "@/components/modal_file";
import { api } from "@/convex/_generated/api";
import {
  SignInButton,
  SignOutButton,
  SignedIn,
  SignedOut,
  useOrganization,
  useUser,
} from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";


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

      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Your Files</h1>

        <ModalFile orgId={orgId}/>
      </div>

      {files?.map((file) => <div key={file._id}>{file.name}</div>)}
    </main>
  );
}
