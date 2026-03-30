import React, { useState, useEffect } from 'react';
import {
  Alert, Box, Button, Card, CardActionArea, CardContent,
  CardMedia, Chip, CircularProgress, Divider, Grid,
  Paper, Skeleton, Stack, Typography,
} from '@mui/material';
import {
  ArrowForward as ArrowIcon,
  AccessTime as TimeIcon,
  LocalFireDepartment as CalIcon,
  OpenInNew as OpenIcon,
} from '@mui/icons-material';
import { fetchMealPlan, AVOID_FOODS_BY_DIET } from '../../services/spoonacularService';


// Tiny recipe card used in the 3-column summary grid

function MiniRecipeCard({ recipe, onClick }) {
  return (
    <Card
      onClick={onClick}
      sx={{
        bgcolor: '#0F172A',
        border: '1px solid #1E293B',
        borderRadius: 3,
        cursor: 'pointer',
        transition: 'transform 0.18s, box-shadow 0.18s',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 12px 32px rgba(99,102,241,0.18)',
          border: '1px solid #6366F1',
        },
      }}
    >
      {recipe.image && (
        <CardMedia
          component="img"
          height={110}
          image={recipe.image}
          alt={recipe.title}
          sx={{ objectFit: 'cover', borderRadius: '12px 12px 0 0' }}
        />
      )}
      <CardContent sx={{ p: '10px !important' }}>
        <Typography
          variant="caption"
          fontWeight={700}
          color="text.primary"
          display="block"
          mb={0.5}
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.35,
            minHeight: 32,
          }}
        >
          {recipe.title}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Stack direction="row" alignItems="center" spacing={0.3}>
            <CalIcon sx={{ fontSize: 11, color: '#F87171' }} />
            <Typography variant="caption" color="#F87171" fontWeight={600}>
              {recipe.calories} kcal
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.3}>
            <TimeIcon sx={{ fontSize: 11, color: '#94A3B8' }} />
            <Typography variant="caption" color="text.secondary">
              {recipe.readyInMinutes}m
            </Typography>
          </Stack>
        </Stack>
        <Stack direction="row" spacing={0.5} mt={0.6}>
          <Chip label={`P ${recipe.protein}g`} size="small" sx={{ fontSize: 9, height: 16, bgcolor: '#1E3A5F', color: '#60A5FA' }} />
          <Chip label={`C ${recipe.carbs}g`} size="small" sx={{ fontSize: 9, height: 16, bgcolor: '#422006', color: '#FCD34D' }} />
          <Chip label={`F ${recipe.fat}g`} size="small" sx={{ fontSize: 9, height: 16, bgcolor: '#2E1065', color: '#C4B5FD' }} />
        </Stack>
      </CardContent>
    </Card>
  );
}


// Skeleton loader for a meal section while fetching

function MealSectionSkeleton() {
  return (
    <Grid container spacing={1.5}>
      {[0, 1, 2].map(i => (
        <Grid item xs={12} sm={4} key={i}>
          <Card sx={{ bgcolor: '#0F172A', borderRadius: 3 }}>
            <Skeleton variant="rectangular" height={110} sx={{ bgcolor: '#1E293B' }} />
            <CardContent sx={{ p: '10px !important' }}>
              <Skeleton variant="text" sx={{ bgcolor: '#1E293B' }} />
              <Skeleton variant="text" width="60%" sx={{ bgcolor: '#1E293B' }} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}


// MAIN COMPONENT

export default function MealSummaryCard({
  mealPlanType,
  diseases = [],
  allergies = '',
  dailyCalories = 2000,
  onViewFullPlan,        // callback → navigate to DietPlanPage
}) {
  const [meals, setMeals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    fetchMealPlan({ dietType: mealPlanType, diseases, allergies, dailyCalories })
      .then(data => {
        if (!cancelled) setMeals(data);
      })
      .catch(err => {
        if (!cancelled) {
          if (err.message === 'INVALID_API_KEY') {
            setError('⚠️ Spoonacular API key is missing or invalid. Add your key to spoonacularService.js');
          } else if (err.message === 'API_LIMIT_REACHED') {
            setError('⚠️ Daily API limit reached (150 requests/day on free plan). Try again tomorrow.');
          } else {
            setError('Could not load recipes. Check your internet connection.');
          }
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [mealPlanType, dailyCalories]);

  const avoidFoods = AVOID_FOODS_BY_DIET[mealPlanType] || [];

  const mealSections = [
    { key: 'breakfast', label: '🌅 Breakfast',  emoji: '🌅' },
    { key: 'lunch',     label: '☀️ Lunch',      emoji: '☀️' },
    { key: 'dinner',    label: '🌙 Dinner',     emoji: '🌙' },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 4,
        p: { xs: 2, md: 3 },
        bgcolor: '#1E293B',
        border: '1px solid #334155',
        borderRadius: 4,
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={1}>
        <Box>
          <Typography variant="h6" fontWeight={700} color="text.primary">
            🍽️ Real Food Recommendations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Live recipes from Spoonacular matched to your {mealPlanType}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          endIcon={<ArrowIcon />}
          onClick={onViewFullPlan}
          sx={{ borderRadius: 99, fontWeight: 700, px: 3 }}
        >
          See Full 7-Day Plan
        </Button>
      </Stack>

      {/* Error */}
      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Meal sections */}
      {mealSections.map(({ key, label }) => (
        <Box key={key} mb={3}>
          <Typography variant="subtitle1" fontWeight={700} color="text.primary" mb={1.5}>
            {label}
          </Typography>
          {loading ? (
            <MealSectionSkeleton />
          ) : meals && meals[key]?.length > 0 ? (
            <Grid container spacing={1.5}>
              {meals[key].map(recipe => (
                <Grid item xs={12} sm={4} key={recipe.id}>
                  <MiniRecipeCard
                    recipe={recipe}
                    onClick={() => onViewFullPlan && onViewFullPlan(recipe.id)}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No recipes found for {key}. Try adjusting your filters.
            </Typography>
          )}
        </Box>
      ))}

      <Divider sx={{ borderColor: '#334155', my: 2 }} />

      {/* Foods to avoid — static, no API needed */}
      <Box>
        <Typography variant="subtitle1" fontWeight={700} color="text.primary" mb={1.5}>
          ❌ Foods to Avoid on {mealPlanType}
        </Typography>
        <Grid container spacing={1.5}>
          {avoidFoods.map((item, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Stack
                direction="row"
                alignItems="flex-start"
                spacing={1.5}
                sx={{
                  p: 1.5,
                  bgcolor: '#0F172A',
                  borderRadius: 2,
                  border: '1px solid #7F1D1D',
                  borderLeft: '3px solid #EF4444',
                }}
              >
                <Typography fontSize={20}>{item.emoji}</Typography>
                <Box>
                  <Typography variant="caption" fontWeight={700} color="#FCA5A5" display="block">
                    {item.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.reason}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* CTA */}
      <Box mt={3} textAlign="center">
        <Button
          variant="outlined"
          color="primary"
          size="large"
          endIcon={<ArrowIcon />}
          onClick={() => onViewFullPlan && onViewFullPlan()}
          sx={{ borderRadius: 99, fontWeight: 700, px: 4 }}
        >
          View Complete Diet Plan with Recipes, Exercises & 7-Day Schedule
        </Button>
      </Box>
    </Paper>
  );
}