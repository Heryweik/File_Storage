import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Doc, Id } from "@/convex/_generated/dataModel";

import {
  BookText,
  FileImage,
  FileText,
  GanttChartIcon,
  ImageIcon,
} from "lucide-react";

import { ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

import {formatRelative} from 'date-fns'
import { FileCardActions } from "./file-actions";

interface FileCardProps {
  // le agregamos la propiedad isFavorited
  file: Doc<"files"> & { isFavorited: boolean; url: string | null };
}

export default function FileCard({ file }: FileCardProps) {
  // useQuery es un hook que permite hacer consultas a la base de datos
  const userProfile = useQuery(api.users.getUserProfile, {
    userId: file.userId,
  });

  const typeIcons = {
    image: <ImageIcon />,
    pdf: <BookText />,
    csv: <GanttChartIcon />,
    txt: <FileText />,
    svg: <FileImage />,
  } as Record<Doc<"files">["type"], ReactNode>;

  /* const isFavorited = favorites.some(
    (favorite) => favorite.fileId === file._id
  ); */

  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle className="flex gap-x-2 text-base font-normal">
          <p>{typeIcons[file.type]}</p>
          {file.name}
        </CardTitle>
        <div className="absolute right-2 top-2">
          <FileCardActions file={file} isFavorited={file.isFavorited} />
        </div>
      </CardHeader>
      <CardContent className="h-[200px] flex justify-center items-center">
      {file.type === "image" && file.url && (
          <Image alt={file.name} width="200" height="100" src={file.url} className="aspect-video object-cover w-full hover:scale-105 transition" />
        )}
        {file.type === "pdf" && <BookText className="h-20 w-20" />}
        {file.type === "csv" && <GanttChartIcon className="h-20 w-20" />}
        {file.type === "txt" && <FileText className="h-20 w-20" />}
        {file.type === "svg" && <FileImage className="h-20 w-20" />}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex justify-center gap-2 text-gray-700 text-xs w-40 items-center">
        <Avatar className="w-6 h-6">
          <AvatarImage src={userProfile?.image} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        {userProfile?.name}
        </div>
        <div className="text-xs text-gray-700">
        Uploaded on {formatRelative(new Date(file._creationTime), new Date())}

        </div>
        
      </CardFooter>
    </Card>
  );
}
