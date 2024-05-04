

# Project Estimation - FUTURE
Date:03-05-2024

Version:V2


# Estimation approach
Consider the EZElectronics  project in FUTURE version (as proposed by your team in requirements V2), assume that you are going to develop the project INDEPENDENT of the deadlines of the course, and from scratch (not from V1)
# Estimate by size
###
|             | Estimate                        |             
| ----------- | ------------------------------- |  
| NC =  Estimated number of classes to be developed   |           10                  |             
|  A = Estimated average size per class, in LOC       |        220                    | 
| S = Estimated size of project, in LOC (= NC * A) | 2200 |
| E = Estimated effort, in person hours (here use productivity 10 LOC per person hour)  | 220                                     |   
| C = Estimated cost, in euro (here use 1 person hour cost = 30 euro) |6600 | 
| Estimated calendar time, in calendar weeks (Assume team of 4 people, 8 hours per day, 5 days per week ) |7 days -> 1.4 week             |               

# Estimate by product decomposition
### 
|         component name    | Estimated effort (person hours)   |             
| ----------- | ------------------------------- | 
|requirement document    | 10 |
| GUI prototype |7 |
|design document |10|
|code |70|
| unit tests |10|
| api tests |5|
| management documents  |4|



# Estimate by activity decomposition
### 
|         Activity name    | Estimated effort (person hours)   |             
| ----------- | ------------------------------- | 
| Plan Meeting         | 4                               |
| Writing Requirements | 28                              |
| 2nd Meeting          | 5                               |
| GUI                  | 10                              |
| Coding               | 100                             |
| Unit Test            | 30                              |
| API Test             | 15                              |
| 3rd Meeting          | 6                               |
| Management Documents | 4                               |


###
plantuml
@startgantt
Project starts 2024-04-10
saturday are closed
sunday are closed

-- EZElectronics --
[Plan Meeting] lasts 1 day

[Writing Requirements] lasts 1 day
[Writing Requirements] starts at [Plan Meeting]'s end
[Requirement Docs] happens at [Writing Requirements]'s end

[2nd Meeting] lasts 1 day
[2nd Meeting] starts at [Writing Requirements]'s end

[GUI] lasts 1 day
[GUI] starts at [2nd Meeting]'s end
[App Prototype] happens at [GUI]'s end

[Coding] lasts 4 days
[Coding] starts at [GUI]'s end

[Unit Test] lasts 1 day
[Unit Test] starts at [Coding]'s end

[API Test] lasts 1 day
[API Test] starts at [Unit Test]'s end

[3rd Meeting] lasts 1 day
[3rd Meeting] starts at [API Test]'s end
[App Ready] happens at [3rd Meeting]'s end 

[Management Documents] lasts 1 day
[Management Documents] starts at [3rd Meeting]'s end
@endgantt

# Summary
The estimate is different depending on the different approaches used. This difference could be explained by the fact that the estimate by size approach does not take into account the preliminary work but rather the efforts made in the coding phase. It is therefore the least precise approach to estimate the effort unlike the estimate by activity decomposition one.

|             | Estimated effort                        |   Estimated duration |          
| ----------- | ------------------------------- | ---------------|
| estimate by size |220| 9 days|
| estimate by product decomposition |116|4 days |
| estimate by activity decomposition |202| 9 days|





