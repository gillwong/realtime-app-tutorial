"use client";

import { useForm } from "react-hook-form";
import Button from "./ui/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { addFriendValidator } from "@/lib/validations/add-friend";
import { useState } from "react";
import { z } from "zod";
import { createFriendRequest as addFriendAction } from "@/lib/actions";

export type FormData = z.infer<typeof addFriendValidator>;

export default function AddFriendButton() {
  const [showSuccessState, setShowSuccessState] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(addFriendValidator),
  });

  async function addFriend(email: string) {
    try {
      const validatedEmail = addFriendValidator.parse({ email });
      await addFriendAction({ email: validatedEmail.email });
      setShowSuccessState(true);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError("email", { message: error.message });
        return;
      }
      if (error instanceof Error) {
        setError("email", { message: error.message });
        return;
      }
      setError("email", { message: "Something went wrong." });
    }
  }

  function onSubmit(data: FormData) {
    addFriend(data.email);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm">
      <label
        htmlFor="email"
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        Add friend by Email
      </label>

      <div className="mt-2 flex gap-4">
        <input
          {...register("email")}
          type="email"
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="you@example.com"
        />
        <Button>Add</Button>
      </div>
      {showSuccessState ? (
        <p className="mt-1 text-sm text-green-600">Friend request sent!</p>
      ) : (
        <p className="mt-1 text-sm text-red-600">{errors.email?.message}</p>
      )}
    </form>
  );
}
