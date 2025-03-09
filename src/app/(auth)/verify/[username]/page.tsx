'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useDebounceCallback } from "usehooks-ts"
import { toast } from "sonner"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { set } from "mongoose"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { verifySchema } from "@/schema/verifySchema"


const VerificationCode = () => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const params = useParams()
    const router = useRouter()
    const form = useForm({
        resolver: zodResolver(verifySchema),
        defaultValues: {
            code: ""
        }
    })

    const onSubmit = async (data: z.infer<typeof verifySchema>) => {
        try {
            setIsSubmitting(true)
            const response = await axios.post('/api/verify-code', {
                username: encodeURIComponent(params.username),
                code: data.code
            })
            toast.success(response.data.message)
            router.push('/sign-in')
            setIsSubmitting(false)
        } catch (error) {
            setIsSubmitting(false)
            toast.error(error?.response.data.message)
        }
    }
  return (
    <div className = "flex justify-center items-center min-h-screen bg-gray-100" >
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                    Verification Code
                </h1>
                
            </div>
              <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                      <FormField
                          control={form.control}
                          name="code"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Verification code</FormLabel>
                                  <FormControl>
                                      <Input placeholder="code" {...field} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                      <Button disabled={isSubmitting} type="submit">
                        {
                            isSubmitting ? <Loader2 className="animate-spin" /> : "Verify Code"
                        }
                      </Button>
                  </form>
              </Form>
        </div>
    </div>
  )
}

export default VerificationCode