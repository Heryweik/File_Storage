import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "./ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookText,
  EllipsisVertical,
  FileIcon,
  FileImage,
  FileText,
  GanttChartIcon,
  ImageIcon,
  StarHalf,
  StarIcon,
  Trash,
  Undo,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ReactNode, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "./ui/use-toast";
import Image from "next/image";
import { Protect } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

import { format, formatDistance, formatRelative, subDays } from 'date-fns'

interface FileCardProps {
  file: Doc<"files">;
  favorites: Doc<"favorites">[];
}

interface FileCardActionsProps {
  file: Doc<"files">;
  isFavorited: boolean;
}

function FileCardActions({ file, isFavorited }: FileCardActionsProps) {
  // useMutation es un hook que permite hacer mutaciones a la base de datos
  const deleteFile = useMutation(api.files.deleteFile);
  const restoreFile = useMutation(api.files.restoreFile);
  const toggleFavorite = useMutation(api.files.toggleFavorite);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  return (
    <>
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will mark the file for deletion proccess. Files are
              deleted peryodically.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await deleteFile({
                  fileId: file._id,
                });
                toast({
                  variant: "default",
                  title: "File marked for deletion",
                  description: "Your file will be deleted soon",
                });
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <EllipsisVertical className="h-5 w-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>

          <DropdownMenuItem
            onClick={() => {
              window.open(getFilesUrl(file.fileId), "_blank");
  
              console.log("direccion del archivo", getFilesUrl(file.fileId));
            }}
            className="flex items-center gap-1  cursor-pointer"
          >
          <FileIcon className="h-4 w-4" /> Download
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => toggleFavorite({ fileId: file._id })}
            className="flex items-center gap-1  cursor-pointer"
          >
            {isFavorited ? (
              <StarIcon className="h-4 w-4 text-yellow-500" />
            ) : (
              <StarIcon className="h-4 w-4" />
            )}
            Favorite
          </DropdownMenuItem>

          <Protect role={"org:admin"} fallback={<></>}>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                if (file.shouldDelete) {
                  restoreFile({
                    fileId: file._id,
                  });
                  toast({
                    variant: "default",
                    title: "File restored",
                    description: "Your file is now available",
                  });
                } else {
                  setIsConfirmOpen(true);
                }
              }}
              className="flex items-center gap-1 cursor-pointer"
            >
              {file.shouldDelete ? (
                <div className=" text-green-600 flex items-center gap-1">
                  <Undo className="h-4 w-4" /> Restore
                </div>
              ) : (
                <div className=" text-red-600 flex items-center gap-1">
                  <Trash className="h-4 w-4" /> Delete
                </div>
              )}
            </DropdownMenuItem>
          </Protect>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

// Obtener los archivos para mostrarlos en la pagina
function getFilesUrl(fileId: Id<"_storage">): string {
  return `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${fileId}`;
}

export default function FileCard({ file, favorites }: FileCardProps) {
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

  const isFavorited = favorites.some(
    (favorite) => favorite.fileId === file._id
  );

  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle className="flex gap-x-2 text-base font-normal">
          <p>{typeIcons[file.type]}</p>
          {file.name}
        </CardTitle>
        <div className="absolute right-2 top-2">
          <FileCardActions file={file} isFavorited={isFavorited} />
        </div>
      </CardHeader>
      <CardContent className="h-[200px] flex justify-center items-center">
        {file.type === "image" && (
          <Image
            src={getFilesUrl(file.fileId)}
            alt={file.name}
            width={300}
            height={300}
          />
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
