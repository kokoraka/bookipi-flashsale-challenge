import * as React from "react"
import { FaRegFrown } from "react-icons/fa";
import * as z from "zod";
import { Button } from "../components/Button"
import { Container } from "../components/Container"
import { Card } from "../components/Card"
import { useConfig } from "../components/Config"
import { Meta } from "../components/Meta"
import { Spinner } from "../components/Spinner"
import { PromotionState, PromotionView } from "../features/Promotion"
import { useGetFlashsalePromotionById, useGetFlashsaleProductById, usePlaceOrder } from "../services/react"
import { ProductView } from "../features/Product"
import { OrderForm, OrderFormData, ProductCard, PromotionAlert } from "../features/Flashsale";
import { useToast } from "../components/Toast";
import { Status, StatusCode } from "../status";
import { generateIds } from "../services/text/idgen";

const defaultOrderForm = {
  email: "",
  name: "",
}

const DEFAULT_QUANTITY = "1"

export default function Home(): React.JSX.Element {
  const config = useConfig()
  const promotionId = config.getString('VITE_PROMOTION_ID')
  const productId = config.getString('VITE_PRODUCT_ID')
  const toast = useToast()

  const [orderForm, setOrderForm] = React.useState(defaultOrderForm)
  const [orderFormLoading, setOrderFormLoading] = React.useState(false)

  const {
    data: promotionData,
    isError: isGetPromotionError,
    isPending: isGetPromotionPending,
    execute: getPromotion
  } = useGetFlashsalePromotionById()

  const {
    data: productData,
    isPending: isGetProductPending,
    execute: getProduct
  } = useGetFlashsaleProductById()

  const {
    execute: placeOrder
  } = usePlaceOrder()

  React.useEffect(() => {
    if (!promotionId) {
      return
    }

    getPromotion([promotionId])
    getProduct([productId])
  }, [
    promotionId, getPromotion,
    productId, getProduct
  ])

  const promotionView = React.useMemo<PromotionView | undefined>(() => {
    if (!promotionData) {
      return undefined
    }

    return new PromotionView({
      unique_id: promotionData.promotion.unique_id,
      start_at: new Date(promotionData.promotion.start_at),
      end_at: new Date(promotionData.promotion.end_at),
      state: promotionData.promotion_state as PromotionState,
    })
  }, [promotionData])

  const productView = React.useMemo<ProductView | undefined>(() => {
    if (!productData) {
      return undefined
    }

    return new ProductView({
      unique_id: productData.product.unique_id,
      name: productData.product.name,
      description: productData.product.description,
      unit_price: Number(productData.product.selling_price),
      available_quantity: Number(productData.inventory.estimate_available_quantity),
      thumbnail_url: productData.product.thumbnail?.file.public_url,
    })
  }, [productData])

  async function handleOrderSubmit(data: OrderFormData) {
    try {
      const validationRule = z.object({
        name: z.string().trim().min(1).max(128),
        email: z.email().trim().min(3).max(188).toLowerCase(),
      });
      const validateRes = await validationRule.safeParseAsync({
        email: data.email,
        name: data.name,
      });
      if (!validateRes.success) {
        const messages = validateRes.error.issues.map((issue) => `${issue.path}: ${issue.message}`)
        toast.warn(<>
          There's invalid information: <br />
          {messages.join('\n')}
        </>)
        return
      }

      const generateRes = generateIds(1)
      if (!generateRes.status.is(StatusCode.SUCCESS) || !generateRes.ids) {
        toast.error(<>
          Failed processing request <br />
          Please try again
        </>)
        return
      }

      const idempotencyKey = generateRes.ids[0].text

      setOrderFormLoading(true)
      const placeRes = await placeOrder({
        email: validateRes.data.email,
        name: validateRes.data.name,
        item_id: productId,
        promotion_id: promotionId,
        quantity: DEFAULT_QUANTITY
      }, {
        headers: {
          'Idempotency-Key': idempotencyKey
        }
      })
      setOrderFormLoading(false)
      const placeStat = Status.fromObjectAlways(placeRes)
      if (!placeStat.is(StatusCode.SUCCESS)) {
        switch (placeStat.code) {
          case
            StatusCode.VALIDATION_INVALID_PARAM,
            StatusCode.VALIDATION_INVALID_STATE:
            toast.warn(placeStat.message)
            break
          default:
            toast.error(placeStat.message)
        }
        return
      }

      toast.success(`Success place order`)
    } catch (e: unknown) {
      const err = e as Error
      toast.error(`Unexpected error: ${err.message}`)
    }
  }

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
                <PromotionAlert
                  isPending={isGetPromotionPending}
                  isError={isGetPromotionError}
                  promotionView={promotionView}
                  retry={() => {
                    getPromotion([promotionId])
                  }}
                />
              </div>
              {
                promotionView &&
                <div className="col-span-12">
                  <div className="w-full h-full rounded border-dashed border-1 border-black p-2">
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-12 sm:col-span-5">
                        {
                          productView ?
                            <ProductCard
                              productView={productView}
                            />
                            :
                            <Card>
                              <div className="flex flex-col gap-2 min-h-[200px]">
                                {
                                  isGetProductPending ?
                                    <div className="py-10">
                                      <Spinner size="sm" label="Loading product..." labeled />
                                    </div>
                                    :
                                    <>
                                      <div className="flex justify-center items-center">
                                        <FaRegFrown className="w-16 h-16" />
                                      </div>
                                      <div className="mt-2 flex flex-col gap-2 justify-center items-center">
                                        <h3 className="text-center text-lg font-bold text-black">
                                          Something happened
                                        </h3>
                                        <p className="text-center text-sm text-black">
                                          Unable to load product information
                                        </p>
                                      </div>
                                      <Button appendClassNames="w-full"
                                        onClick={() => {
                                          getProduct([productId])
                                        }}>
                                        Retry
                                      </Button>
                                    </>
                                }
                              </div>
                            </Card>
                        }
                      </div>
                      <div className="col-span-12 sm:col-span-7">
                        <OrderForm
                          data={orderForm}
                          onChange={(data) => {
                            setOrderForm((prevState) => ({
                              ...prevState,
                              ...data,
                            }))
                          }}
                          onSubmit={handleOrderSubmit}
                          disabled={
                            (productView && !productView.hasStock()) ||
                            orderFormLoading
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </section>
      </Container>
    </>
  )
}