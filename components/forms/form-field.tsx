"use client";

import * as React from "react";
import { Calendar } from "../ui/calendar";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

interface SelectOption {
  label: string;
  value: string;
}

interface FormFieldProps {
  label: string;
  name: string;
  id: string;
  placeholder?: string;
  required?: boolean;
  error?: string[];
  helperText?: string;

  textarea?: boolean;
  checkbox?: boolean;
  calendar?: boolean;
  select?: boolean;

  options?: SelectOption[];
  defaultValue?: string;
  defaultChecked?: boolean;
  /** When set, the text input is controlled (`value` + `onChange`). */
  value?: string;

  onChange?: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;

  onCheckedChange?: (checked: boolean) => void;
  selectedDate?: Date;
  onSelectDate?: (date: Date | undefined) => void;

  selectValue?: string;
  onValueChange?: (value: string) => void;
}

export const FormField = ({
  label,
  name,
  id,
  placeholder,
  required = false,
  error = [],
  helperText,
  textarea,
  checkbox,
  calendar,
  select,
  options = [],
  onChange,
  onCheckedChange,
  selectedDate,
  onSelectDate,
  selectValue,
  onValueChange,
  defaultValue,
  defaultChecked,
  value,
}: FormFieldProps) => {
  return (
    <div className="space-y-2" data-field={id}>
      {checkbox ? (
        <div className="flex items-center gap-2">
          <Checkbox
            id={id}
            defaultChecked={defaultChecked}
            onCheckedChange={(checked) => onCheckedChange?.(checked === true)}
          />
          <Label htmlFor={id}>{label}</Label>
        </div>
      ) : (
        <>
          <Label htmlFor={id}>{label}</Label>

          {textarea ? (
            <Textarea
              id={id}
              name={name}
              placeholder={placeholder}
              required={required}
              defaultValue={defaultValue}
              onChange={
                onChange as React.ChangeEventHandler<HTMLTextAreaElement>
              }
            />
          ) : calendar ? (
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onSelectDate}
              className="rounded-md border"
            />
          ) : select ? (
            <Select value={selectValue} onValueChange={onValueChange}>
              <SelectTrigger id={id} className="w-full">
                <SelectValue placeholder={placeholder || "Select an option"} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={id}
              name={name}
              placeholder={placeholder}
              required={required}
              inputMode="decimal"
              autoComplete="off"
              {...(value !== undefined
                ? {
                    value,
                    onChange:
                      onChange as React.ChangeEventHandler<HTMLInputElement>,
                  }
                : {
                    defaultValue,
                    onChange:
                      onChange as React.ChangeEventHandler<HTMLInputElement>,
                  })}
            />
          )}
        </>
      )}

      {helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}

      {error.length > 0 && (
        <p className="text-sm text-destructive">{error.join(", ")}</p>
      )}
    </div>
  );
};
