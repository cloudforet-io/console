# Number of possible widget cases
sm, md, lg, xl, full

- 1 select
5PI1 = 5
- 2 select
5PI2 = 25
- 3 select
5PI3 = 125
- 4 select
5PI4 = 625
- 5 select
5PI5 = 3125
- ...
- n select
5PIn = Math.pow(5,n) === 5 ** n

---
# Number of possible screen size cases
19 (320px, 400px, 480px ... 1840px)

---
# Number of test cases
Number of Widgets n * Number of Screen Size

n:1 => 5 * 19 = 95
n:2 => 25 * 19 = 475
n:3 => 125 * 19 = 2375
n:4 => 625 * 19 = 11875
n:5 => 3125 * 19 = 59375
...
n:n => Math.pow(5,n) * 19 === (5 ** n) * 19 

