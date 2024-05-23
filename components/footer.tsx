import Link from "next/link";



export default function Footer() {
  return (
    <div className="h-20 mt-7 w-full bg-gray-100 flex items-center">
        <div className="container mx-auto flex justify-between items-center">
        <div>FileDrive</div>

        <Link className="text-blue-400 hover:text-blue-600" href="/privacy">Privacy Policy</Link>
        <Link className="text-blue-400 hover:text-blue-600" href="/terms-of-service">Terms of Services</Link>
        <Link className="text-blue-400 hover:text-blue-600" href="/about">About</Link>

        </div>
    </div>
  )
}
