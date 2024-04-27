# Requirements Document - current EZElectronics

Date:

Version: V1.2 - description of EZElectronics in CURRENT form (as received by teachers)

| Version number | Change |
| :------------: | :----: |
|  1.1           | Functional Requirements and Stakeholders added.       |
|  1.2           | Stories and Personas and Non Functional Requirements added.       |


# Contents

- [Requirements Document - current EZElectronics](#requirements-document---current-ezelectronics)
- [Contents](#contents)
- [Informal description](#informal-description)
- [Stakeholders](#stakeholders)
- [Context Diagram and interfaces](#context-diagram-and-interfaces)
  - [Context Diagram](#context-diagram)
  - [Interfaces](#interfaces)
- [Stories and personas](#stories-and-personas)
- [Functional and non functional requirements](#functional-and-non-functional-requirements)
  - [Functional Requirements](#functional-requirements)
  - [Non Functional Requirements](#non-functional-requirements)
- [Use case diagram and use cases](#use-case-diagram-and-use-cases)
  - [Use case diagram](#use-case-diagram)
    - [Use case 1, UC1](#use-case-1-uc1)
      - [Scenario 1.1](#scenario-11)
      - [Scenario 1.2](#scenario-12)
      - [Scenario 1.x](#scenario-1x)
    - [Use case 2, UC2](#use-case-2-uc2)
    - [Use case x, UCx](#use-case-x-ucx)
- [Glossary](#glossary)
- [System Design](#system-design)
- [Deployment Diagram](#deployment-diagram)

# Informal description

EZElectronics (read EaSy Electronics) is a software application designed to help managers of electronics stores to manage their products and offer them to customers through a dedicated website. Managers can assess the available products, record new ones, and confirm purchases. Customers can see available products, add them to a cart and see the history of their past purchases.

# Stakeholders

| Stakeholder name | Description |
| :--------------: | :---------: |
| Customer         | Application user that intends on buying from the store by selecting the products, adding them to the cart and checkout the cart.|
| Manager          | Application user responsible for managing the state of the App (list of products, product availability) and registering the sales in the app. |
| Seller at Point Of Sale (POS)| Person responsible for managing the sale at the POS, by handing the bought items to the customer and receiving the payment. Can also be the manager, but not necessarily. |
| Store Owner      | Owner of the electronics store who purchases the EZElectronics software in order to have a dedicated website facilitating its sales.|

# Context Diagram and interfaces

## Context Diagram

\<Define here Context diagram using UML use case diagram>

\<actors are a subset of stakeholders>

## Interfaces

\<describe here each interface in the context diagram>

\<GUIs will be described graphically in a separate document>

|   Actor   | Logical Interface | Physical Interface |
| :-------: | :---------------: | :----------------: |
| Actor x.. |                   |                    |

# Stories and personas

### Persona 1:
Maria, female, 35 years old, store manager of an electronic store
Story: Maria aims to streamline the process of managing her store’s product and making them available online for customers

### Persona 2:
John, male, 40 years old, manager of multiple stores
Story: John manages multiple electronic stores across the city and needs a centralized system to oversee all the stores

### Persona 3:
Anita, 25 years old, customer
Story: Anita is a regular customer of an electronic store and prefers to shop online from her smartphone due to her busy schedule

# Functional and non functional requirements

## Functional Requirements

\<In the form DO SOMETHING, or VERB NOUN, describe high level capabilities of the system>

\<they match to high level use cases>

|  ID       | Description |
| :---:     | :---------: |
|  FR1      | Manage Users |
|  FR1.1    | Add User (Unclear who can add an user and in what context, as no authentication is required to call UserRoutes.router.post, and both manager and customer users can be crated) |
|  FR2      | Manage Products |
|  FR2.1    | Register new products |
|  FR2.2    | Register the arrival of a set of previously registered products |
|  FR2.3    | Register the sale of a product |
|  FR2.4    | See a list of products |
|  FR2.4.1  | This list can be filtered by: sold/not sold, a specific product, a specific category |
|  FR2.5    | Delete a product |
|  FR3      | Manage Carts |
|  FR3.1    | Add a product to its own cart |
|  FR3.1.1  | A product can not be added to a cart cart twice |
|  FR3.1.2  | A product can not be added to the cart if ti is sold out |
|  FR3.2    | Remove a product from it’s own cart |
|  FR3.2.1  | Products can not be removed from the cart if it has already been paid for |
|  FR3.3    | Check out the cart |
|  FR3.4    | Customer can see it’s own cart history from last purchases |
|  FR3.4.1  | Only previous carts that have been paid for can be found |
|  FR4      | Authorization and Authentication |
|  FR4.1    | Log in and Log out |
|  FR4.2    | Allow customer functionalities only for logged in customer |
|  FR4.2.1  | Customer functionalities are the ones described in FR3.X |
|  FR4.3    | Allow manager functionalities only for logged in managers |
| FR4.3.1   | Manager functionalities are the ones are described in FR2.X |

## Non Functional Requirements

\<Describe constraints on functional requirements>

|   ID    | Type (efficiency, reliability, ..) | Description | Refers to |
| :-----: | :--------------------------------: | :---------: | :-------: |
|  NFR1   |    Usability                                |      Web application should be intuitive and user-friendly, requiring no specialized training for customers already familiar with e-commerce apps and websites. Managers should also find it straightforward to use it for different functions.       |    All FR       |
|  NFR2   |    Efficiency                                |      All functions on the app must be completed in < 0.1 s, excluding internet connection time       |  All FR         |
|  NFR3   |     Reliability                               |  No more than one defect per year per user, server must be online and operational 99% of the time      |    All FR       |
| NFR4 |    Security                              | Data security and sharing between users and stores must be handled securely and in compliance with privacy regulations.        |    FR4       |
| NFR5 |    Portability                              | Compatibility with most common browser (Chrome, Safari, Edge…)        |    All FR      |

# Use case diagram and use cases

## Use case diagram

\<define here UML Use case diagram UCD summarizing all use cases, and their relationships>

\<next describe here each use case in the UCD>

### Use case 1, UC1

| Actors Involved  |                                                                      |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | \<Boolean expression, must evaluate to true before the UC can start> |
|  Post condition  |  \<Boolean expression, must evaluate to true after UC is finished>   |
| Nominal Scenario |         \<Textual description of actions executed by the UC>         |
|     Variants     |                      \<other normal executions>                      |
|    Exceptions    |                        \<exceptions, errors >                        |

##### Scenario 1.1

\<describe here scenarios instances of UC1>

\<a scenario is a sequence of steps that corresponds to a particular execution of one use case>

\<a scenario is a more formal description of a story>

\<only relevant scenarios should be described>

|  Scenario 1.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | \<Boolean expression, must evaluate to true before the scenario can start> |
| Post condition |  \<Boolean expression, must evaluate to true after scenario is finished>   |
|     Step#      |                                Description                                 |
|       1        |                                                                            |
|       2        |                                                                            |
|      ...       |                                                                            |

##### Scenario 1.2

##### Scenario 1.x

### Use case 2, UC2

..

### Use case x, UCx

..

# Glossary

\<use UML class diagram to define important terms, or concepts in the domain of the application, and their relationships>

\<concepts must be used consistently all over the document, ex in use cases, requirements etc>

# System Design

\<describe here system design>

\<must be consistent with Context diagram>

# Deployment Diagram

\<describe here deployment diagram >
