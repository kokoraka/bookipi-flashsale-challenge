# Flash Sale

Flash sales ordering platform submission.

## Requirements

### Functional Requirements
1. List on-sales products
- There's only 1 product (simplification purposes)

2. User identification mechanism
- Enter user identification, e.g: username or email (simplification purposes)

3. Create order
- Allow order creation within certain `start_time` and `end_time` period
- There's only 1 product (simplification purposes)
- 1 User is only allowed to purchase 1 quantity of on-sales product (simplification purposes)

4. View order
- View order information

### Non-Functional Requirements
1. Scalability
- During peak session, there'll be a lot of users using the platform (e.g: >1k concurrent users)
- Prepare for more load, potential bottlenecks and how to mitigate the problems

2. Fault Tolerance
- System should be able to handle service crashes, network and other issues during heavy load

3. Concurrency
- Prevent over-selling and race conditions from happening when purchasing products

### Out-of Scoped Requirements
1. Authentication and user management
- No need to implement full authentication (simplification purposes)

2. Product management
- Each product has different available stock, but no need to implement the product management

3. Promotion management
- For this purposes we'd assume there will be only 1 flash sale promotion period, we won't implement the promotion management
- Promotion data will be mocked instead of using real database tables

4. Multiple currency support and currency management
- We'll assume all the currency represented in Australian Dollar (simplification purposes)
- Currency data will be mocked instead of using real database table

## System Design

### Code Architecture

1. Monorepo (commerce, frontend)
2. Clean Architecture (port-adapter)

### System Architecture

![System Architecture](./docs/assets/architecture-final.png)

### Entity Relationship Diagram

![Entity Relationship Diagram](./docs/assets/entity-relationship-diagram-final.png)

### Flow Diagram

1. Get Promotion

![Get Promotion](./docs/assets/flow-get-promotion.png)

2. Get Product

![Get Product](./docs/assets/flow-get-product.png)

3. Place Order

![Place Order](./docs/assets/flow-place-order.png)

4. Process Order

![Process Order](./docs/assets/flow-process-order.png)

5. Get Order

![Get Order](./docs/assets/flow-get-order.png)

6. Stock Reconciliation

![Stock Reconciliation](./docs/assets/flow-stock-reconciliation.png)

## User Interfaces

![Mock Up](./docs/assets/user-interface-final.png)

![Promotion Disabled](./docs/assets/ui-promotion-disabled.png)

![Promotion Upcoming](./docs/assets/ui-promotion-upcoming.png)

![Promotion Ongoing](./docs/assets/ui-promotion-ongoing.png)

![Promotion Ended](./docs/assets/ui-promotion-ended.png)

![Stock in Stock](./docs/assets/ui-stock-in-stock.png)

![Stock out Stock](./docs/assets/ui-stock-out-stock.png)

![Stock Running out Stock](./docs/assets/ui-stock-running-out.png)

![Order Placed](./docs/assets/ui-order-placed.png)

![Order Insufficient](./docs/assets/ui-order-insufficient-stock.png)

![Order 1 Item Rule](./docs/assets/ui-order-1-item-per-user.png)

![Order Created](./docs/assets/ui-order-created.png)

## Technologies

### Commerce (Gateway)
- NestJS = ease the service scafolding / boilerplate
- REST = client transport layer with server
- OpenAPI = generate client, server and documentation
- Grafana k6 = Performance testing tools
