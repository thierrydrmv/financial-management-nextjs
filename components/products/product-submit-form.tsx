"use client";

import { Loader2Icon, SparklesIcon } from "lucide-react";
import { FormField } from "../forms/form-field";
import { Button } from "../ui/button";
import { addProductAction } from "@/lib/products/product-actions";
import { useActionState } from "react";
import { FormState } from "@/types";
import { cn } from "@/lib/utils";

const initialState: FormState = {
  success: false,
  errors: {},
  message: "",
};

export default function ProductSubmitForm() {
  const [state, formAction, isPending] = useActionState(
    addProductAction,
    initialState,
  );

  const { errors, message, success } = state;
  const getFieldErrors = (fieldName: string): string[] => {
    if (!errors) return [];
    return (errors as Record<string, string[]>)[fieldName] ?? [];
  };

  return (
    <form className="space-y-6" action={formAction}>
      {message && (
        <div
          className={cn(
            "p-4 rounded-lg border",
            success
              ? "bg-primary/10 border-primary text-primary"
              : "bg-destructive/10 border-destructive text-destructive",
          )}
          role="alert"
          aria-live="polite"
        >
          {message}
        </div>
      )}
      <FormField
        label="Product Name"
        id="name"
        name="name"
        placeholder="My Awesome Product"
        required
        onChange={() => {}}
        error={getFieldErrors("name")}
      />
      <FormField
        label="Slug"
        id="slug"
        name="slug"
        placeholder="My Awesome Product"
        required
        onChange={() => {}}
        error={getFieldErrors("slug")}
        helperText="URL-friendly version of the product name"
      />
      <FormField
        label="Tagline"
        id="tagline"
        name="tagline"
        placeholder="A brief, catchy description"
        required
        onChange={() => {}}
        error={getFieldErrors("tagline")}
      />
      <FormField
        label="Description"
        id="description"
        name="description"
        placeholder="Tell us more about your project..."
        required
        onChange={() => {}}
        error={getFieldErrors("description")}
        textarea
      />

      <FormField
        label="Website URL"
        id="websiteUrl"
        name="websiteUrl"
        placeholder="https://yourproduct.com"
        required
        onChange={() => {}}
        error={getFieldErrors("websiteUrl")}
        helperText="Enter your product's website or landing page"
      />
      <FormField
        label="Tags"
        id="tags"
        name="tags"
        placeholder="AI, Productivity, SaaS"
        required
        onChange={() => {}}
        error={getFieldErrors("tags")}
        helperText="Comma-separated tags (e.g, AI, SaaS, Productivity)"
      />
      <Button type="submit" size="lg" className="w-full">
        {isPending ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <>
            <SparklesIcon className="size-4" />
            Submit Product
          </>
        )}
      </Button>
    </form>
  );
}
