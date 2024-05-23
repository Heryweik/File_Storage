
  import { Doc, Id } from "@/convex/_generated/dataModel";
 
  
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
  import {
    EllipsisVertical,
    EyeIcon,
    FileIcon,
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
  import {useState } from "react";
  import { useMutation, useQuery} from "convex/react";
  import { api } from "@/convex/_generated/api";
  import { toast } from "./ui/use-toast";
import { Protect } from "@clerk/nextjs";

  interface FileCardActionsProps {
    file: Doc<"files"> & { url: string | null };
    isFavorited: boolean;
  }
  
  export function FileCardActions({ file, isFavorited }: FileCardActionsProps) {
    // useMutation es un hook que permite hacer mutaciones a la base de datos
    const deleteFile = useMutation(api.files.deleteFile);
    const restoreFile = useMutation(api.files.restoreFile);
    const toggleFavorite = useMutation(api.files.toggleFavorite);
    const me = useQuery(api.users.getMe);

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
                if (!file.url) return;
                window.open(file.url, "_blank");
              }}
              className="flex items-center gap-1  cursor-pointer"
            >
            <EyeIcon className="h-4 w-4" /> Watch
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
  
            <Protect condition={(check) => {
              return check({
                role: "org:admin",
              }) || file.userId === me?._id;
            }} fallback={<></>}>
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
  /* export function getFilesUrl(fileId: Id<"_storage">): string {
    return `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${fileId}`;
  } */
  