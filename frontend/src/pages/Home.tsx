import * as React from "react"
import { Alert } from "../components/Alert"
import { Button } from "../components/Button"
import { Container } from "../components/Container"
import { Meta } from "../components/Meta"
import { useGetFlashsalePromotionById } from "../services/react"
import { useConfig } from "../components/Config"
import { Spinner } from "../components/Spinner"
import { Info } from "../features/Page"
import { PromotionState, PromotionView } from "../features/Promotion"

export default function Home(): React.JSX.Element {
  const config = useConfig()
  const promotionId = config.getString('VITE_PROMOTION_ID')

  const {
    data,
    isError: isGetPromotionError,
    isPending: isGetPromotionPending,
    execute: getPromotion
  } = useGetFlashsalePromotionById()

  React.useEffect(() => {
    if (!promotionId) {
      return
    }

    getPromotion([promotionId])
  }, [promotionId, getPromotion])

  const promotionView = React.useMemo<PromotionView | undefined>(() => {
    if (!data) {
      return undefined
    }

    return new PromotionView({
      unique_id: data.promotion.unique_id,
      start_at: new Date(data.promotion.start_at),
      end_at: new Date(data.promotion.end_at),
      state: data.promotion_state as PromotionState,
    })
  }, [data])

  return (
    <>
      <Meta>
        {{
          title: "Order",
        }}
      </Meta>

      <Container size="md">
        <section className="w-full h-screen bg-gray-100 px-4 py-8">
          <div className="w-full max-w-2xl mx-auto">
            <div className="grid grid-cols-12">
              <div className="col-span-12">
                <div className="flex flex-col gap-2">
                  <h1 className="font-bold text-3xl">
                    Flashsale Order
                  </h1>
                  <div className="border-dashed border-b-2 border-black" />
                </div>
              </div>
              <div className="col-span-12">
                {
                  isGetPromotionPending ?
                    <div className="py-40">
                      <Spinner size="sm" label="Loading promotion..." labeled />
                    </div>
                    :
                    (
                      isGetPromotionError ?
                        <>
                          <Alert variant="danger" opened>
                            {{
                              header: <>Error happened</>,
                              content:
                                <div className="flex flex-col gap-2">
                                  <p>Failed get promotion information</p>
                                  <div>
                                    <Button onClick={() => {
                                      getPromotion([promotionId])
                                    }}>
                                      Try again
                                    </Button>
                                  </div>
                                </div>,
                            }}
                          </Alert>
                        </>
                        :
                        (
                          promotionView ?
                            <Alert variant="warning" opened>
                              {{
                                header: <>{promotionView.getStateLabel()}</>,
                                content: <>
                                  ({promotionView.getStateMessage()})
                                </>,
                              }}
                            </Alert>
                            :
                            <Info
                              title={`Promotion unavailable`}
                              subtitle={`Are you looking for something?`} />
                        )
                    )
                }
              </div>
            </div>
          </div>
        </section>
      </Container>
    </>
  )
}