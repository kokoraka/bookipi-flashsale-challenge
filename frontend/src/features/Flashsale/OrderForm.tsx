
import { Button } from "../../components/Button"
import { RowGroup } from "../../components/Form"
import { InputText } from "../../components/Input"

export type OrderFormData = {
  email: string
  name: string
}

type OrderFormProps = {
  disabled?: boolean
  data?: OrderFormData
  onChange?: (data: OrderFormData) => void
  onSubmit?: (data: OrderFormData) => void
}

export function OrderForm(
  props: Readonly<OrderFormProps>,
): React.JSX.Element {
  const {
    disabled = false,
    data = {
      email: "",
      name: "",
    },
    onChange,
    onSubmit,
  } = props

  const handleChange = (
    field: keyof OrderFormData,
    value: string,
  ): void => {
    onChange?.({
      ...data,
      [field]: value,
    })
  }

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ): void => {
    event.preventDefault()
    onSubmit?.(data)
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-2">
        <RowGroup>
          <label className="font-bold text-sm" htmlFor="email">
            <span className="text-red-600">*</span>
            <span className="text-black">Email</span>
          </label>

          <InputText
            id="email"
            name="email"
            placeholder="Enter email address"
            value={data.email}
            onChange={(event) => {
              handleChange("email", event.target.value)
            }}
            disabled={disabled}
            required
          />
        </RowGroup>

        <RowGroup>
          <label className="font-bold text-sm" htmlFor="name">
            <span className="text-red-600">*</span>
            <span className="text-black">Name</span>
          </label>

          <InputText
            id="name"
            name="name"
            placeholder="Enter name"
            value={data.name}
            onChange={(event) => {
              handleChange("name", event.target.value)
            }}
            disabled={disabled}
            required
          />
        </RowGroup>
      </div>

      <RowGroup>
        <Button
          appendClassNames="w-full"
          disabled={disabled}
          type="submit"
        >
          Buy Now
        </Button>
      </RowGroup>
    </form>
  )
}
