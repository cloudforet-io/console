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
135 (320px, 336px, 352px ... 1824px, 1840px)

---
# Number of test cases
Number of Widgets n * Number of Screen Size

n=1 => 5 * 135 = 675
n=2 => 25 * 135 = 3375
n=3 => 125 * 135 = 16875
n=4 => 625 * 135 = 84375 
n=5 => 3125 * 135 = 421875
...
n=n => Math.pow(5,n) * 135 === (5 ** n) * 19 

