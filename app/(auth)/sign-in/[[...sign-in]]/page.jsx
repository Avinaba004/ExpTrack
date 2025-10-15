import { SignIn } from '@clerk/nextjs'
import React from 'react'

const page = () => {
  return (
    <div className="align-items:center">
      <SignIn/>
    </div>
  )
}

export default page
