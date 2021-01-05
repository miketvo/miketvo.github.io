# rmit-sgs-network-game
Demonstration for Assignment 3, COSC2083 "Introduction to Information Technology" - RMIT VN, Semester 2020C


# Project idea: JavaScript game for RMIT wireless network


### Overview:

A simple HTML game loaded onto the user’s device whenever there is an internet connection issue on RMIT Saigon South (SGS) campus network as a replacement for the default connection timed out error page displayed on the user’s web browser. It would be a simple and addictive retro/arcade game intended as a distraction for the users to ease the network traffic and raise awareness about RMIT SGS campus network issue.


### Motivation:

The internet connection at RMIT University Vietnam SGS Campus has frequently been an issue among staffs and students, and more so during the recent months of Semester 3 of 2020. This is evidenced on the RMIT Confessions Facebook page as a quick search for posts containing the word “wifi” shows a lot of complaints about the slow network connection at SGS campus that appears to coincide with the student influx in Semester 3 of each year. Furthermore, in a recent Facebook post on November 28th, 2020, RMIT University Vietnam wrote: “Internet usage at SGS campus has recently been unstable due to the overuse of streaming platforms for music, movies, YouTube, Facebook and other services not directly related to academic needs. This has been severely impacting the digital experience of our community…”[1] This issue is undeniably a controversial topic of discussion recognized by both the faculties and students. Although we have yet to find an effective solution for this problem, my idea would work as a short-term solution to get the matter more recognition, and in the long term to provide our campus community with a geeky insider only “easter egg” campus feature.


### Description:

The local wireless network at RMIT SGS would send a custom error page containing the error message and a HTML game to the user’s browser whenever a connection timed out error occurs. This concept is similar in idea to the Dinosaur Game developed by Google for their Chrome browser[2], but this would instead be implemented on a network-wide system, not just on the local machine. The process is visually described in Fig 1 shown below (heavily simplified for brevity):

![Fig 1. Internet access at RMIT](https://github.com/miketvo/miketvo.github.io/blob/main/images/12.2020/Fig-1-Internet-access-at-RMIT.jpg)

*Fig 1. Internet access at RMIT*
 
In the game, the player controls RMIT’s mascot – Rupert the Redback spider (Fig 2) shooting his spider web at the ceiling to swing from left to right while avoiding dangerous obstacles. The objective is to travel as furthest away from the starting point as possible. It would feature a lives system: Rupert has three lives, each time he hits the ceiling, the floor, or and obstacle, he would lose one. The game ends when Rupert has no lives left and the score is then reported to the player based on the distance travelled (Fig 3). The obstacles are randomly generated indefinitely until the game ends. To further engage the player, achievements would be given every 500 meters travelled, and the score would be saved into a scoreboard on RMIT network so that students can compete with each other for highscore.
The game would feature a flat design so that the RMIT Logo can be easily incorporated into the character design (Fig 3). Thus, the physics system will be modeled after real-life physics instead of the arcade-style physics usually implemented in games with pixel art sprites. For this task, the Phaser game framework is the perfect tool as it also features an accurate real-life physics model (See Tools and Technologies).
   
![Fig 2. Rupert the Redback Spider](https://github.com/miketvo/miketvo.github.io/blob/main/images/12.2020/rmit-rupert.jpg)

*Fig 2. Rupert the Redback Spider*

The page should be compatible with both mobile and desktop platforms. Thus, the game must be responsive to different screen sizes and must feature keyboard, mouse, and touchscreen input for consistent and optimal user experience across devices. For that reason, the control must be simple and intuitive for mobile compatibility.
At the moment, I have come up with two candidate control schemes:
*	Control scheme 1 (Fig 3):
  *	On desktop devices: The player controls Rupert by pressing the left and right arrow key to swing left and right, respectively. The spacebar is used for shooting and cutting the spider web.
  * On mobile devices: The left and right side of the screen would be used to control Rupert’s direction of swinging. Pressing both sides simultaneously would be used for shooting and cutting the spider web.
* Control scheme 2:
  * On desktop devices: A constant wind force would blow Rupert from left to right, and the player only use the spacebar or click on the screen to shoot and cut the spider web.
  *	On mobile devices: The mechanism is similar to that on the desktop except pressing anywhere on the screen would be used in place of the spacebar/mouse.
  *	Extra feature: The wind strength will be increased incrementally every 500 meters travelled for scaled difficulty.
  
![Fig 3. Preliminary concept sketches](https://github.com/miketvo/miketvo.github.io/blob/main/images/12.2020/concept-sketch-capture-12-14-2020.jpg)

*Fig 3. Preliminary concept sketches*


### Tools and Technologies:

*	Game engine: Phaser (https://phaser.io). Phaser a popular and easy-to-learn open-source 2D HTML5 game framework actively developed and maintained by Photon Storm[3] on GitHub (https://github.com/photonstorm/phaser).
*	Sprites and other arts: Aseprite for pixel arts, Photoshop, Illustrator, or other open-source equivalents such as Gimp and Inkscape for more complex raster and vector photo editing capabilities.
*	Sound design: Audacity for rudimentary audio editing and Studio One for production-quality audio engineering.
*	Version control: Git with repository hosted on GitHub (https://github.com).
* Permission to access RMIT University Vietnam SGS Campus wireless network hardware. This would be the hardest part of this project due to strict network authorization at RMIT SGS campus.


## References

[1]	RMIT University Vietnam, "Solution for the wi-fi issue at SGS Campus," https://www.facebook.com/RMITUniversityVietnam/photos/a.680416032023173/3688582664539813/, Ed., ed, 2020.

[2]	A. Roshan. "Google Easter Eggs : 15+ Best Google Easter Eggs & Google Tricks 2017." https://web.archive.org/web/20170805055813/http://feedsyouneed.com/google-easter-eggs-google-tricks/ (accessed December 4th, 2020).


## Extras

**Full post can be found here: https://miketvo.github.io/blog/project-idea-nov-2020.html**
