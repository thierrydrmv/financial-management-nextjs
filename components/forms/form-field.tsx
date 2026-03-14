import { Calendar } from "../ui/calendar";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface FormFieldProps {
  label: string;
  name: string;
  id: string;
  placeholder?: string;
  required: boolean;
  onChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  error: string[];
  helperText?: string;
  textarea?: boolean;
  checkbox?: boolean;
  calendar?: boolean;
}

export const FormField = ({
  label,
  name,
  id,
  placeholder,
  required,
  onChange,
  error,
  helperText,
  textarea,
  checkbox,
  calendar,
}: FormFieldProps) => {
  return (
    <div className="space-y-2">
      {checkbox ? (
        <div className="flex items-center gap-2">
          <Checkbox id={id} />
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
              onChange={
                onChange as (e: React.ChangeEvent<HTMLTextAreaElement>) => void
              }
            />
          ) : calendar ? (
            <Calendar />
          ) : (
            <Input
              id={id}
              name={name}
              placeholder={placeholder}
              required={required}
              onChange={
                onChange as (e: React.ChangeEvent<HTMLInputElement>) => void
              }
            />
          )}
        </>
      )}
      {helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
      {error && <p className="text-sm text-destructive">{error.join(", ")}</p>}
    </div>
  );
};
