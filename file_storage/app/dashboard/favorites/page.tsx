"use client"

import { FileBrowser } from '@/components/file-browser'
import { api } from '@/convex/_generated/api'
import { useQuery } from 'convex/react'
import React from 'react'

export default function FavoritePage() {



  return (
    <div>
        <FileBrowser title={"Your Favorites"} favoritesOnly />
    </div>
  )
}
