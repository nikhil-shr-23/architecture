'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ProfileImageProps {
  avatarUrl: string | null
  fullName: string | null
  isOwnProfile: boolean
}

export default function ProfileImage({ avatarUrl, fullName, isOwnProfile }: ProfileImageProps) {
  const handleProfileImageClick = () => {
    if (isOwnProfile) {
      // Find and click the settings tab
      document.querySelector('[data-state="inactive"][value="settings"]')?.click()
    }
  }

  return (
    <div className="h-32 w-32 rounded-full border-4 border-white overflow-hidden bg-white relative">
      {avatarUrl ? (
        <div className="h-full w-full">
          <Image
            src={avatarUrl}
            alt={fullName || 'Profile picture'}
            width={128}
            height={128}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        </div>
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </div>
      )}
      {isOwnProfile && (
        <div
          onClick={handleProfileImageClick}
          className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center transition-all cursor-pointer"
        >
          <div className="opacity-0 hover:opacity-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}
