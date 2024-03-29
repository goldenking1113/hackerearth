const express = require('express');
const axios = require('axios');
const app = express();

// Function to fetch badge activity data
async function fetchBadgeActivity(username) {
    try {
        const response = await axios.get(`https://www.hackerearth.com/profiles/api/${username}/badge-activity/`);
        const badgeActivity = response.data;
        
        // Extracting badge data
        const badges = badgeActivity.badge_data.reduce((acc, category) => {
            return acc.concat(category.badges.map(badge => ({
                Name: badge.badge.name,
                Level: badge.badge.level,
                Points: badge.badge.points
            })));
        }, []);
        
        const numberOfBadges = badges.length;
        
        // Extracting problem solved count
        const problemSolved = badgeActivity.he_metrics ? badgeActivity.he_metrics.problem_solved : 0;

        // Constructing the desired format
        const formattedData = {
            NumberOfBadges: numberOfBadges,
            Badges: badges,
            ProblemSolved: problemSolved
        };

        return formattedData;
    } catch (error) {
        console.error('Error fetching badge activity data:', error);
        throw new Error('Failed to fetch badge activity data');
    }
}


// Function to fetch challenge activity data
async function fetchChallengeActivity(username) {
    try {
        const response = await axios.get(`https://www.hackerearth.com/profiles/api/${username}/challenge-activity/`);
        const challengeActivity = response.data;

        // Check if ratings_graph array exists and has elements
        if (challengeActivity.contest_data.ratings_graph && challengeActivity.contest_data.ratings_graph.length > 0) {
            // Extract the rating value
            const rating = challengeActivity.contest_data.ratings_graph[0].rating;

            // If rating is null, throw an error
            if (rating === null) {
                throw new Error('Rating is null');
            }

            // Construct the desired format
            const formattedData = {
                contestRatings: {
                    Rating: rating
                }
            };

            return formattedData;
        } else {
            // If no rating data available, return a default value
            const formattedData = {
                contestRatings: {
                    Rating: 0 // You can set any default value here
                }
            };

            return formattedData;
        }
    } catch (error) {
        console.error('Error fetching challenge activity data:', error);
        throw new Error('Failed to fetch challenge activity data');
    }
}




// Route to fetch both badge and challenge activity data for a username
app.get('/:username', async (req, res) => {
    const { username } = req.params;

    try {
        const [badgeActivity, challengeActivity] = await Promise.all([
            fetchBadgeActivity(username),
            fetchChallengeActivity(username)
        ]);
        
        res.json({ badgeActivity, challengeActivity });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
