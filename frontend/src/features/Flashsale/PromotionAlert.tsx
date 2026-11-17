import { Alert, AlertVariant } from "../../components/Alert"
import { Button } from "../../components/Button"
import { Spinner } from "../../components/Spinner"
import { PromotionView } from "../Promotion"
import { Info } from "../Page"

type PromotionAlertProps = {
  isPending?: boolean
  isError?: boolean
  promotionView?: PromotionView
  retry?: () => void
}

export function PromotionAlert(
  props: Readonly<PromotionAlertProps>,
): React.JSX.Element {
  const {
    isPending = false,
    isError = false,
    promotionView,
    retry,
  } = props

  if (isPending) {
    return (
      <div className="py-40">
        <Spinner size="sm" label="Loading promotion..." labeled />
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="danger" opened>
        {{
          header: <>Error happened</>,
          content: (
            <div className="flex flex-col gap-2">
              <p>Failed get promotion information</p>
              <div>
                <Button onClick={retry}>
                  Try again
                </Button>
              </div>
            </div>
          ),
        }}
      </Alert>
    )
  }

  if (promotionView) {
    let variant = AlertVariant.INFO
    if (promotionView.isUpcoming()) {
      variant = AlertVariant.WARNING
    } else if (promotionView.isOngoing()) {
      variant = AlertVariant.SUCCESS
    } else if (promotionView.isEnded()) {
      variant = AlertVariant.DANGER
    }

    return (
      <Alert variant={variant} opened>
        {{
          header: <>{promotionView.getStateLabel()}</>,
          content: (
            <>
              ({promotionView.getStateMessage()})
            </>
          ),
        }}
      </Alert>
    )
  }

  return (
    <div className="h-screen flex flex-col gap-4 md:gap-8 justify-center items-center">
      <Info
        title="Promotion unavailable"
        subtitle="Are you looking for something?"
      />
      <div className="flex flex-col justify-center items-center">
        <Button onClick={retry}>
          Try again
        </Button>
      </div>
    </div>
  )
}
