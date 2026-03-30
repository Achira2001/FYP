import React, { useState, useEffect, useCallback } from 'react';
import {
  Alert, Box, Button, Card, CardContent, CardMedia, Chip,
  CircularProgress, Container, Dialog, DialogContent,
  DialogTitle, Divider, Grid, IconButton, LinearProgress,
  Paper, Skeleton, Stack, Tab, Tabs, Typography,
  Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  AccessTime as TimeIcon,
  LocalFireDepartment as CalIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  FitnessCenter as ExerciseIcon,
  MenuBook as RecipeIcon,
  CalendarMonth as CalendarIcon,
  Block as AvoidIcon,
  OpenInNew as OpenIcon,
  Print as PrintIcon,
  Restaurant as FoodIcon,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  fetchMealPlan,
  getRecipeDetails,
  AVOID_FOODS_BY_DIET,
  EXERCISES_BY_DIET,
} from '../../services/spoonacularService';


//  THEME — reuse your existing medivaTheme

const medivaTheme = createTheme({
  palette: {
    mode: 'dark',
    primary:    { main: '#6366F1', light: '#A5B4FC', dark: '#4338CA' },
    secondary:  { main: '#A855F7' },
    background: { default: '#0F172A', paper: '#1E293B' },
    text:       { primary: '#F1F5F9', secondary: '#CBD5E1' },
    divider:    '#334155',
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 9999, textTransform: 'none', fontWeight: 700 } } },
    MuiTab:    { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
  },
});

// Diet type accent colours
const DIET_COLORS = {
  'Balanced Diet':     '#6366F1',
  'High-Protein Diet': '#EF4444',
  'Low-Carb Diet':     '#F59E0B',
  'Low-Fat Diet':      '#10B981',
};


//  RECIPE CARD — full card used on the Meals tab

function RecipeCard({ recipe, accentColor, onViewDetails }) {
  const proteinCal = recipe.protein * 4;
  const carbsCal   = recipe.carbs * 4;
  const fatCal     = recipe.fat * 9;
  const total      = proteinCal + carbsCal + fatCal || 1;

  return (
    <Card
      sx={{
        bgcolor: '#1E293B',
        border: '1px solid #334155',
        borderRadius: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 16px 40px ${accentColor}22`,
          border: `1px solid ${accentColor}66`,
        },
      }}
    >
      {recipe.image && (
        <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: '12px 12px 0 0' }}>
          <CardMedia
            component="img"
            height={180}
            image={recipe.image}
            alt={recipe.title}
            sx={{ objectFit: 'cover' }}
          />
          <Box sx={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(transparent, rgba(15,23,42,0.9))',
            p: 1.5,
          }}>
            <Stack direction="row" spacing={1}>
              <Stack direction="row" alignItems="center" spacing={0.4}>
                <CalIcon sx={{ fontSize: 13, color: '#F87171' }} />
                <Typography variant="caption" color="#F87171" fontWeight={700}>{recipe.calories} kcal</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.4}>
                <TimeIcon sx={{ fontSize: 13, color: '#94A3B8' }} />
                <Typography variant="caption" color="#94A3B8">{recipe.readyInMinutes} min</Typography>
              </Stack>
            </Stack>
          </Box>
        </Box>
      )}

      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: '16px !important' }}>
        <Typography variant="subtitle1" fontWeight={700} color="text.primary" mb={1} lineHeight={1.3}>
          {recipe.title}
        </Typography>

        {/* Macro colour bar */}
        <Stack direction="row" spacing={0} mb={1} sx={{ height: 6, borderRadius: 3, overflow: 'hidden' }}>
          <Box flex={proteinCal / total} sx={{ bgcolor: '#EF4444' }} />
          <Box flex={carbsCal / total} sx={{ bgcolor: '#F59E0B' }} />
          <Box flex={fatCal / total} sx={{ bgcolor: '#8B5CF6' }} />
        </Stack>
        <Stack direction="row" spacing={2} mb={1.5}>
          <Typography variant="caption" color="#EF4444">P: {recipe.protein}g</Typography>
          <Typography variant="caption" color="#F59E0B">C: {recipe.carbs}g</Typography>
          <Typography variant="caption" color="#8B5CF6">F: {recipe.fat}g</Typography>
          {recipe.fiber > 0 && <Typography variant="caption" color="#6EE7B7">Fiber: {recipe.fiber}g</Typography>}
        </Stack>

        {/* Diet tags */}
        {recipe.diets?.length > 0 && (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" mb={1.5}>
            {recipe.diets.slice(0, 3).map(d => (
              <Chip key={d} label={d} size="small" sx={{ fontSize: 9, height: 18, bgcolor: `${accentColor}22`, color: accentColor }} />
            ))}
          </Stack>
        )}

        <Box flex={1} />

        {/* Buttons */}
        <Stack direction="row" spacing={1} mt={1}>
          <Button
            variant="contained"
            size="small"
            onClick={() => onViewDetails(recipe.id)}
            fullWidth
            sx={{ bgcolor: accentColor, '&:hover': { bgcolor: accentColor, filter: 'brightness(1.1)' } }}
          >
            View Recipe
          </Button>
          {recipe.sourceUrl && (
            <IconButton
              size="small"
              href={recipe.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: 'text.secondary', border: '1px solid #334155', borderRadius: 2 }}
            >
              <OpenIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}


//  RECIPE DETAIL DIALOG

function RecipeDetailDialog({ recipeId, accentColor, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!recipeId) return;
    setLoading(true);
    getRecipeDetails(recipeId)
      .then(setDetail)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [recipeId]);

  return (
    <Dialog
      open={Boolean(recipeId)}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { bgcolor: '#1E293B', borderRadius: 3, border: '1px solid #334155' } }}
    >
      <DialogTitle sx={{ p: 0 }}>
        {detail?.image && (
          <Box sx={{ position: 'relative' }}>
            <Box
              component="img"
              src={detail.image}
              alt={detail.title}
              sx={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: '12px 12px 0 0' }}
            />
            <Box sx={{
              position: 'absolute', bottom: 0, left: 0, right: 0, p: 2,
              background: 'linear-gradient(transparent, rgba(15,23,42,0.95))',
            }}>
              <Typography variant="h6" fontWeight={700} color="white">
                {detail?.title}
              </Typography>
            </Box>
          </Box>
        )}
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(15,23,42,0.7)', color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Stack spacing={2}>
            {[1,2,3].map(i => <Skeleton key={i} height={40} sx={{ bgcolor: '#334155' }} />)}
          </Stack>
        ) : detail ? (
          <>
            {/* Macro summary */}
            <Grid container spacing={2} mb={3}>
              {[
                { label: 'Calories', value: `${detail.calories} kcal`, color: '#F87171' },
                { label: 'Protein',  value: `${detail.protein}g`,      color: '#EF4444' },
                { label: 'Carbs',    value: `${detail.carbs}g`,        color: '#F59E0B' },
                { label: 'Fat',      value: `${detail.fat}g`,          color: '#8B5CF6' },
              ].map(m => (
                <Grid item xs={6} sm={3} key={m.label}>
                  <Paper sx={{ p: 1.5, bgcolor: '#0F172A', textAlign: 'center', borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ color: m.color }}>{m.value}</Typography>
                    <Typography variant="caption" color="text.secondary">{m.label}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* Ingredients */}
            <Accordion defaultExpanded sx={{ bgcolor: '#0F172A', border: '1px solid #334155', borderRadius: '8px !important', mb: 1.5 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={700}>🥕 Ingredients ({detail.ingredients?.length || 0})</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={1}>
                  {(detail.ingredients || []).map((ing, i) => (
                    <Grid item xs={12} sm={6} key={i}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: accentColor, flexShrink: 0 }} />
                        <Typography variant="body2" color="text.secondary">{ing.original}</Typography>
                      </Stack>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Instructions */}
            <Accordion sx={{ bgcolor: '#0F172A', border: '1px solid #334155', borderRadius: '8px !important', mb: 1.5 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={700}>👨‍🍳 Instructions ({detail.instructions?.length || 0} steps)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1.5}>
                  {(detail.instructions || []).map((step) => (
                    <Stack key={step.number} direction="row" spacing={2} alignItems="flex-start">
                      <Box sx={{
                        width: 28, height: 28, borderRadius: '50%', bgcolor: accentColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        <Typography variant="caption" fontWeight={700} color="white">{step.number}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" pt={0.4}>{step.step}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Full recipe link */}
            {detail.sourceUrl && (
              <Button
                fullWidth
                variant="outlined"
                endIcon={<OpenIcon />}
                href={detail.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ mt: 1, borderColor: accentColor, color: accentColor }}
              >
                View Full Recipe on Source Website
              </Button>
            )}
          </>
        ) : (
          <Alert severity="error">Could not load recipe details.</Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}


//  WEEKLY SCHEDULE TAB

function WeeklyScheduleTab({ meals, mealSplit, accentColor }) {
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const { breakfast = [], lunch = [], dinner = [], snacks = [] } = meals || {};

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3, bgcolor: '#0F2942', color: '#93C5FD', border: '1px solid #1E3A5F' }}>
        This 7-day schedule rotates through your personalised recipe recommendations. Each day is balanced to meet your calorie targets.
      </Alert>

      <Stack spacing={2}>
        {days.map((day, i) => {
          const b = breakfast[i % Math.max(breakfast.length, 1)];
          const l = lunch[i % Math.max(lunch.length, 1)];
          const d = dinner[i % Math.max(dinner.length, 1)];
          const s = snacks[i % Math.max(snacks.length, 1)];

          return (
            <Accordion
              key={day}
              defaultExpanded={i === 0}
              sx={{ bgcolor: '#1E293B', border: '1px solid #334155', borderRadius: '12px !important', '&:before': { display: 'none' } }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" alignItems="center" spacing={2} width="100%">
                  <Box sx={{
                    width: 40, height: 40, borderRadius: '50%', bgcolor: accentColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <Typography fontWeight={800} color="white" fontSize={13}>{day.slice(0,3).toUpperCase()}</Typography>
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700}>{day}</Typography>
                  <Box flex={1} />
                  <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', sm: 'flex' } }}>
                    {[b, l, d].filter(Boolean).map((r, ri) => (
                      r?.image
                        ? <Box key={ri} component="img" src={r.image} sx={{ width: 36, height: 36, borderRadius: 1, objectFit: 'cover', border: `2px solid ${accentColor}` }} />
                        : <Box key={ri} sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: '#334155' }} />
                    ))}
                  </Stack>
                </Stack>
              </AccordionSummary>

              <AccordionDetails sx={{ pt: 0 }}>
                <Grid container spacing={2}>
                  {[
                    { label: '🌅 Breakfast', recipe: b, budget: mealSplit?.breakfast },
                    { label: '☀️ Lunch',     recipe: l, budget: mealSplit?.lunch },
                    { label: '🌙 Dinner',    recipe: d, budget: mealSplit?.dinner },
                    { label: '🍎 Snack',     recipe: s, budget: mealSplit?.snack },
                  ].map(({ label, recipe, budget }) => (
                    <Grid item xs={12} sm={6} md={3} key={label}>
                      <Paper sx={{ p: 1.5, bgcolor: '#0F172A', borderRadius: 2, height: '100%' }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}>
                          {label}
                        </Typography>
                        {recipe ? (
                          <>
                            {recipe.image && (
                              <Box
                                component="img"
                                src={recipe.image}
                                alt={recipe.title}
                                sx={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 1.5, mb: 1 }}
                              />
                            )}
                            <Typography variant="caption" fontWeight={600} color="text.primary" display="block" mb={0.5}>
                              {recipe.title}
                            </Typography>
                            <Stack direction="row" spacing={1}>
                              <Typography variant="caption" color="#F87171">{recipe.calories} kcal</Typography>
                              <Typography variant="caption" color="text.disabled">/ {budget} target</Typography>
                            </Stack>
                          </>
                        ) : (
                          <Typography variant="caption" color="text.secondary">Loading...</Typography>
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Stack>
    </Box>
  );
}


//  EXERCISES TAB

function ExercisesTab({ mealPlanType, accentColor }) {
  const exercises = EXERCISES_BY_DIET[mealPlanType] || [];

  const intensityColor = { Low: '#10B981', Moderate: '#F59E0B', High: '#EF4444' };

  return (
    <Box>
      <Alert severity="success" sx={{ mb: 3, bgcolor: '#052e16', color: '#86EFAC', border: '1px solid #14532D' }}>
        These exercises are specifically selected to complement your {mealPlanType}. Combining diet + exercise produces the best results.
      </Alert>
      <Grid container spacing={2}>
        {exercises.map((ex, i) => (
          <Grid item xs={12} md={6} key={i}>
            <Card sx={{
              bgcolor: '#1E293B',
              border: '1px solid #334155',
              borderRadius: 3,
              borderLeft: `4px solid ${accentColor}`,
              height: '100%',
            }}>
              <CardContent>
                <Stack direction="row" alignItems="flex-start" spacing={2}>
                  <Typography fontSize={36}>{ex.emoji}</Typography>
                  <Box flex={1}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
                      <Typography variant="subtitle1" fontWeight={700}>{ex.name}</Typography>
                      <Chip
                        label={ex.intensity}
                        size="small"
                        sx={{ bgcolor: `${intensityColor[ex.intensity]}22`, color: intensityColor[ex.intensity], fontWeight: 700, fontSize: 11 }}
                      />
                    </Stack>
                    <Chip label={ex.type} size="small" sx={{ bgcolor: '#334155', color: 'text.secondary', mb: 1.5, fontSize: 10 }} />
                    <Grid container spacing={1}>
                      <Grid item xs={4}>
                        <Paper sx={{ p: 1, bgcolor: '#0F172A', textAlign: 'center', borderRadius: 1.5 }}>
                          <Typography variant="caption" color="text.secondary" display="block">Duration</Typography>
                          <Typography variant="caption" fontWeight={700} color="text.primary">{ex.duration}</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={4}>
                        <Paper sx={{ p: 1, bgcolor: '#0F172A', textAlign: 'center', borderRadius: 1.5 }}>
                          <Typography variant="caption" color="text.secondary" display="block">Frequency</Typography>
                          <Typography variant="caption" fontWeight={700} color="text.primary">{ex.frequency}</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={4}>
                        <Paper sx={{ p: 1, bgcolor: '#0F172A', textAlign: 'center', borderRadius: 1.5 }}>
                          <Typography variant="caption" color="text.secondary" display="block">Burns</Typography>
                          <Typography variant="caption" fontWeight={700} color="#F87171">~{ex.calories} kcal</Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}


//  AVOID FOODS TAB

function AvoidFoodsTab({ mealPlanType }) {
  const avoidFoods = AVOID_FOODS_BY_DIET[mealPlanType] || [];

  return (
    <Box>
      <Alert severity="warning" sx={{ mb: 3, bgcolor: '#431407', color: '#FED7AA', border: '1px solid #7C2D12' }}>
        Avoiding these foods consistently will significantly improve your results. Small dietary changes create lasting habits.
      </Alert>
      <Grid container spacing={2}>
        {avoidFoods.map((item, i) => (
          <Grid item xs={12} md={6} key={i}>
            <Card sx={{
              bgcolor: '#1E293B',
              border: '1px solid #7F1D1D',
              borderLeft: '4px solid #EF4444',
              borderRadius: 3,
            }}>
              <CardContent sx={{ py: '14px !important' }}>
                <Stack direction="row" alignItems="flex-start" spacing={2}>
                  <Typography fontSize={32}>{item.emoji}</Typography>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} color="#FCA5A5">
                      ❌ {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={0.3}>
                      {item.reason}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}


//  MAIN PAGE COMPONENT

export default function DietPlanPage({
  // Pass all these from the parent (DietPlanForm state / router state)
  mealPlanType = 'Balanced Diet',
  diseases = [],
  allergies = '',
  dailyCalories = 2000,
  proteinGrams = 150,
  carbsGrams = 200,
  fatsGrams = 60,
  patientName = 'Patient',
  initialRecipeId = null,   // open a specific recipe immediately
  onBack,                   // callback to go back to results
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [meals, setMeals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRecipeId, setSelectedRecipeId] = useState(initialRecipeId);

  const accentColor = DIET_COLORS[mealPlanType] || '#6366F1';

  // Fetch all recipes on mount
  useEffect(() => {
    setLoading(true);
    fetchMealPlan({ dietType: mealPlanType, diseases, allergies, dailyCalories })
      .then(setMeals)
      .catch(err => {
        if (err.message === 'INVALID_API_KEY') {
          setError('Spoonacular API key is missing or invalid. Add your key to spoonacularService.js');
        } else if (err.message === 'API_LIMIT_REACHED') {
          setError('Daily API limit reached (150 requests/day on free tier). Try again tomorrow.');
        } else {
          setError('Could not load recipes: ' + err.message);
        }
      })
      .finally(() => setLoading(false));
  }, [mealPlanType, dailyCalories]);

  const mealSections = [
    { key: 'breakfast', label: 'Breakfast', emoji: '🌅' },
    { key: 'lunch',     label: 'Lunch',     emoji: '☀️' },
    { key: 'dinner',    label: 'Dinner',    emoji: '🌙' },
    { key: 'snacks',    label: 'Snacks',    emoji: '🍎' },
  ];

  return (
    <ThemeProvider theme={medivaTheme}>
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0F172A 0%, #0D0D1A 40%, #0F1F12 100%)',
        pb: 6,
      }}>
        {/* TOP HEADER BAR  */}
        <Box sx={{
          background: `linear-gradient(90deg, ${accentColor}18 0%, transparent 60%)`,
          borderBottom: `1px solid ${accentColor}33`,
          px: { xs: 2, md: 4 },
          py: 2,
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(12px)',
        }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton onClick={onBack} sx={{ color: 'text.secondary', '&:hover': { color: accentColor } }}>
                <BackIcon />
              </IconButton>
              <Box>
                <Typography variant="h6" fontWeight={800} color="text.primary">
                  {mealPlanType}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Full Diet Plan for {patientName} · {dailyCalories} kcal/day
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Chip
                label={`P ${proteinGrams}g`}
                size="small"
                sx={{ bgcolor: '#7F1D1D', color: '#FCA5A5', fontWeight: 700 }}
              />
              <Chip
                label={`C ${carbsGrams}g`}
                size="small"
                sx={{ bgcolor: '#422006', color: '#FCD34D', fontWeight: 700 }}
              />
              <Chip
                label={`F ${fatsGrams}g`}
                size="small"
                sx={{ bgcolor: '#2E1065', color: '#C4B5FD', fontWeight: 700 }}
              />
              <IconButton
                onClick={() => window.print()}
                size="small"
                sx={{ color: 'text.secondary', border: '1px solid #334155', borderRadius: 2 }}
              >
                <PrintIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>
        </Box>

        <Container maxWidth="xl" sx={{ pt: 4 }}>
          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/*  TABS  */}
          <Box sx={{ borderBottom: 1, borderColor: '#334155', mb: 4 }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              TabIndicatorProps={{ sx: { bgcolor: accentColor, height: 3, borderRadius: 2 } }}
              sx={{ '& .Mui-selected': { color: `${accentColor} !important` } }}
            >
              <Tab icon={<RecipeIcon />}  label="Meal Recipes"    iconPosition="start" />
              <Tab icon={<CalendarIcon />} label="7-Day Schedule" iconPosition="start" />
              <Tab icon={<ExerciseIcon />} label="Exercises"      iconPosition="start" />
              <Tab icon={<AvoidIcon />}   label="Foods to Avoid"  iconPosition="start" />
            </Tabs>
          </Box>

          {/*  TAB 0: MEAL RECIPES  */}
          {activeTab === 0 && (
            <Box>
              {loading ? (
                // Skeleton state
                mealSections.map(({ key, label, emoji }) => (
                  <Box key={key} mb={5}>
                    <Typography variant="h6" fontWeight={700} mb={2}>{emoji} {label}</Typography>
                    <Grid container spacing={2}>
                      {[0,1,2].map(i => (
                        <Grid item xs={12} sm={6} md={4} key={i}>
                          <Card sx={{ bgcolor: '#1E293B', borderRadius: 3 }}>
                            <Skeleton variant="rectangular" height={180} sx={{ bgcolor: '#334155' }} />
                            <CardContent>
                              <Skeleton sx={{ bgcolor: '#334155' }} />
                              <Skeleton width="60%" sx={{ bgcolor: '#334155' }} />
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                ))
              ) : (
                mealSections.map(({ key, label, emoji }) => {
                  const list = meals?.[key] || [];
                  return (
                    <Box key={key} mb={5}>
                      <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                        <Typography variant="h6" fontWeight={700}>{emoji} {label} Options</Typography>
                        {list.length > 0 && (
                          <Chip
                            label={`${list.length} recipes`}
                            size="small"
                            sx={{ bgcolor: `${accentColor}22`, color: accentColor }}
                          />
                        )}
                      </Stack>
                      {list.length > 0 ? (
                        <Grid container spacing={2}>
                          {list.map(recipe => (
                            <Grid item xs={12} sm={6} md={4} key={recipe.id}>
                              <RecipeCard
                                recipe={recipe}
                                accentColor={accentColor}
                                onViewDetails={setSelectedRecipeId}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <Alert severity="info">
                          No {label.toLowerCase()} recipes matched your dietary filters. Try loosening restrictions.
                        </Alert>
                      )}
                    </Box>
                  );
                })
              )}
            </Box>
          )}

          {/*  TAB 1: 7-DAY SCHEDULE */}
          {activeTab === 1 && (
            loading
              ? <Box textAlign="center" py={6}><CircularProgress sx={{ color: accentColor }} /></Box>
              : <WeeklyScheduleTab meals={meals} mealSplit={meals?.mealSplit} accentColor={accentColor} />
          )}

          {/*  TAB 2: EXERCISES */}
          {activeTab === 2 && (
            <ExercisesTab mealPlanType={mealPlanType} accentColor={accentColor} />
          )}

          {/*  TAB 3: AVOID FOODS */}
          {activeTab === 3 && (
            <AvoidFoodsTab mealPlanType={mealPlanType} />
          )}
        </Container>

        {/*  RECIPE DETAIL DIALOG  */}
        <RecipeDetailDialog
          recipeId={selectedRecipeId}
          accentColor={accentColor}
          onClose={() => setSelectedRecipeId(null)}
        />
      </Box>
    </ThemeProvider>
  );
}