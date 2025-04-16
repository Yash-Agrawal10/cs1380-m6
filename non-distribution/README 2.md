
# M0: Setup & Centralized Computing

> Add your contact information below and in `package.json`.

* name: Yash Agrawal

* email: yash_agrawal@brown.edu

* cslogin: yagrawa1


## Summary

> Summarize your implementation, including the most challenging aspects; remember to update the `report` section of the `package.json` file with the total number of hours it took you to complete M0 (`hours`), the total number of JavaScript lines you added, including tests (`jsloc`), the total number of shell lines you added, including for deployment and testing (`sloc`).

My implementation consists of 8 components (5 self-written) addressing T1--8. The most challenging aspect was implementing the merge function. My implementation was generally pretty straightforward. One small tricky thing was using the query selector for getURLs, as I had not used it much before. But, the main tricky part of the assignment was definitely merge. One thing I did was deliberately try to use asserts to validate the structure of the documents I operated on throughout the file to ensure no weird errors occurred. Beyond that, I basically destructured both the local and global index into JavaScript maps (as objects), with terms as keys. I used this structure to be able to easily insert things from the local index into the global index. I chose to just sort the global index list for a term every time I inserted into it. While there could be some optimization here, I kept it simple for now. 
Testing for performance and correctness were also somewhat tricky. I had to learn a lot more about shell scripts to do this, but in the end it worked alright. I think I tested for reasonable cases as well as a few important edge cases. 


## Correctness & Performance Characterization


> Describe how you characterized the correctness and performance of your implementation.


To characterize correctness, we developed about 20 test cases that test the following cases: edge cases, common cases, single and multi-word cases, various HTML and URL, inherently sorted and unsorted cases, stopwords, etc.


*Performance*: The throughput of various subsystems is described in the `"throughput"` portion of package.json. The characteristics of my development machines are summarized in the `"dev"` portion of package.json.


## Wild Guess

> How many lines of code do you think it will take to build the fully distributed, scalable version of your search engine? Add that number to the `"dloc"` portion of package.json, and justify your answer below.

This really is a wild guess, but the implementations of the components were not too long, however testing files took up a reasonable number of lines, so I think 300 is a reasonable estimate, although inflated.