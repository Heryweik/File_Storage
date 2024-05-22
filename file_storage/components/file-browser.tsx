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
import { GridIcon, Loader2, Rows, TableIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { DataTable } from "./file-table";
import { columns } from "./colums";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Doc } from "@/convex/_generated/dataModel";
import { Label } from "./ui/label";

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
  favoritesOnly?: boolean;
  deletedOnly?: boolean;
}

export function FileBrowser({
  title,
  favoritesOnly,
  deletedOnly,
}: FileBrowserProps) {
  // clerk nos da la organización actual y el usuario
  const organization = useOrganization();
  const user = useUser();
  const [query, setQuery] = useState("");
  // El tipo de archivo que queremos ver, por defecto es "all"
  const [type, setType] = useState<Doc<"files">["type"] | "all">("all");

  let orgId = undefined;
  // Si la organización y el usuario están cargados, entonces el orgId es el id de la organización, si no, es el id del usuario, el ?? es para que si no hay organización, se use el id del usuario
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization?.organization?.id ?? user?.user?.id;
  }

  const favorites = useQuery(
    api.files.getAllFavorites,
    orgId ? { orgId } : "skip"
  );

  // Le decimos que queremos los archivos de la organización actual, esto va en base al args de la query en el archivo convex/files.ts
  const files = useQuery(
    api.files.getFiles,
    orgId
      ? {
          orgId,
          type: type === "all" ? undefined : type,
          query,
          favorites: favoritesOnly,
          deletedOnly,
        }
      : "skip"
  );
  const isLoading = files === undefined;

  // Le agregamos la propiedad isFavorited a cada archivo, para saber si está en favoritos o no
  const modifiedFiles =
    files?.map((file) => {
      return {
        ...file,
        // los arreglos vacíos son falsos, por lo que si hay algún archivo en favoritos que tenga el mismo id que el archivo actual, entonces el archivo actual está en favoritos
        isFavorited: (favorites ?? []).some(
          (favorite) => favorite.fileId === file._id
        ),
      };
    }) ?? [];

  // El newType es el nuevo tipo de archivo que queremos ver, si es "all" entonces no filtramos por tipo, si no, filtramos por el tipo que queremos ver
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">{title}</h1>

        <SearchBar query={query} setQuery={setQuery} />
        <UploadButton orgId={orgId} />
      </div>

      <Tabs defaultValue="grid">
        <div className="flex justify-between items-center">
          <TabsList className="mb-2">
            <TabsTrigger value="grid" className="flex gap-2 items-center">
              <GridIcon />
              Grid
            </TabsTrigger>
            <TabsTrigger value="table" className="flex gap-2 items-center">
              <Rows />
              Table
            </TabsTrigger>
          </TabsList>
          <div className="flex gap-2 items-center">
            <Label htmlFor="type-Select">Type Filter</Label>
            <Select
              value={type}
              onValueChange={(newType) => {
                setType(newType as any);
              }}
            >
              <SelectTrigger
                id="type-Select"
                className="w-[180px]"
                defaultValue={"all"}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="txt">TXT</SelectItem>
                <SelectItem value="svg">SVG</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading && (
          <div className="flex flex-col gap-6 w-full items-center mt-20">
            <Loader2 className="h-32 w-32 animate-spin text-gray-500" />
            <div className="text-2xl">Loading your files...</div>
          </div>
        )}

        <TabsContent value="grid">
          <div className="grid  lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
            {modifiedFiles?.map((file) => (
              <FileCard key={file._id} file={file} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="table">
          <DataTable columns={columns} data={modifiedFiles} />
        </TabsContent>
      </Tabs>

      {favoritesOnly ? (
        <div className="w-full h-full text-center mt-20 text-2xl font-semibold">
          <p>Favorites Files...</p>
        </div>
      ) : deletedOnly ? (
        <div className="w-full h-full text-center mt-20 text-2xl font-semibold">
          <p>Deleted Files...</p>
        </div>
      ) : (
        <>{files?.length === 0 && <Placeholder orgId={orgId} />}</>
      )}
    </div>
  );
}
