import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  TextField,
} from "@mui/material";
import DashboardLayout from "../../components/layout/Navbar";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import {
  createTournament,
  getTournament,
  updateTournament,
} from "../../services/tournamentService";
import { getSports } from "../../services/sportService";
import { TOURNAMENT_STATUSES, TOURNAMENT_TYPES } from "../../utils/constants";

function TournamentForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEditMode);
  const [sports, setSports] = useState([]);
  const [sportsLoading, setSportsLoading] = useState(true);
  const [sportsError, setSportsError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      sport: "",
      type: "team",
      location: "",
      startDate: "",
      endDate: "",
      registrationStartDate: "",
      registrationEndDate: "",
      organizer: "",
      description: "",
      status: "Draft",
      maxParticipants: "",
    },
  });



  const watchStartDate = watch("startDate");
  const watchEndDate = watch("endDate");
  const watchRegistrationStartDate = watch("registrationStartDate");
  const watchRegistrationEndDate = watch("registrationEndDate");
  const selectedSport = watch("sport");

  useEffect(() => {
    async function loadSports() {
      setSportsLoading(true);
      setSportsError(null);

      try {
        const activeSports = await getSports({ onlyActive: true });
        setSports(activeSports);
      } catch (error) {
        console.error("Failed to load active sports:", error);
        setSportsError(
          "Unable to load sports. Please check your network or Firestore permissions."
        );
      } finally {
        setSportsLoading(false);
      }
    }

    loadSports();
  }, []);

  useEffect(() => {
    if (!isEditMode && !sportsLoading && sports.length > 0 && !selectedSport) {
      reset((currentValues) => ({
        ...currentValues,
        sport: sports[0].name,
      }));
    }
  }, [isEditMode, sportsLoading, sports, selectedSport, reset]);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    async function loadTournament() {
      setLoading(true);
      try {
        const tournament = await getTournament(id);
        if (!tournament) {
          setSubmitError("Tournament not found.");
          return;
        }

        const loadedSport = tournament.sport || "";
        reset({
          name: tournament.name || "",
          sport: loadedSport,
          type: tournament.type || "team",
          location: tournament.location || "",
          startDate: tournament.startDate
            ? tournament.startDate.toISOString().slice(0, 10)
            : "",
          endDate: tournament.endDate ? tournament.endDate.toISOString().slice(0, 10) : "",
          registrationStartDate: tournament.registrationStartDate
            ? tournament.registrationStartDate.toISOString().slice(0, 10)
            : "",
          registrationEndDate: tournament.registrationEndDate
            ? tournament.registrationEndDate.toISOString().slice(0, 10)
            : "",
          organizer: tournament.organizer || "",
          description: tournament.description || "",
          status: tournament.status || "Draft",
          maxParticipants: tournament.maxParticipants || "",
        });

        if (loadedSport) {
          setSports((prev) =>
            prev.some((sport) => sport.name === loadedSport)
              ? prev
              : [
                  ...prev,
                  { id: loadedSport.toLowerCase().replace(/\s+/g, "_"), name: loadedSport, active: true },
                ]
          );
        }
      } catch (error) {
        console.error(error);
        setSubmitError("Unable to load tournament details. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadTournament();
  }, [id, isEditMode, reset]);

  const buildTournamentPayload = (data) => ({
    name: data.name.trim(),
    sport: data.sport,
    type: data.type,
    location: data.location.trim(),
    startDate: new Date(data.startDate),
    endDate: new Date(data.endDate),
    registrationStartDate: new Date(data.registrationStartDate),
    registrationEndDate: new Date(data.registrationEndDate),
    organizer: data.organizer.trim(),
    description: data.description.trim(),
    status: data.status,
    maxParticipants: Number(data.maxParticipants),
  });

  const onSubmit = async (data) => {
    setSubmitError(null);
    setSuccessMessage("");

    if (!sports || sports.length === 0) {
      setSubmitError("Cannot save tournament without an active sport. Add a sport first.");
      return;
    }

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const registrationStart = new Date(data.registrationStartDate);
    const registrationEnd = new Date(data.registrationEndDate);

    if (end < start) {
      setSubmitError("End date must be the same day or after the start date.");
      return;
    }

    if (registrationEnd < registrationStart) {
      setSubmitError("Registration end date must be the same day or after registration start.");
      return;
    }

    if (registrationStart > start) {
      setSubmitError("Registration start date must be on or before the tournament start date.");
      return;
    }

    if (registrationEnd > end) {
      setSubmitError("Registration end date must be on or before the tournament end date.");
      return;
    }

    try {
      const payload = buildTournamentPayload(data);

      if (isEditMode) {
        await updateTournament(id, payload);
        navigate("/admin/tournaments", {
          state: { successMessage: "Tournament updated successfully." },
        });
      } else {
        await createTournament(payload);
        navigate("/admin/tournaments", {
          state: { successMessage: "Tournament created successfully." },
        });
      }
    } catch (error) {
      console.error(error);
      if (error?.code === "permission-denied") {
        setSubmitError(
          "Unable to save tournament due to Firestore permissions. Verify your role and rules."
        );
      } else {
        setSubmitError("Unable to save tournament. Please try again.");
      }
    }
  };

  if (loading || sportsLoading) {
    return (
      <DashboardLayout>
        <Loader message={sportsLoading ? "Loading available sports..." : "Loading tournament details..."} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title={isEditMode ? "Edit Tournament" : "Create Tournament"}
        subtitle={
          isEditMode
            ? "Update tournament details and save changes."
            : "Configure a new tournament and publish it."
        }
      />

      <Card>
        <CardContent>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {sportsError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {sportsError}
              </Alert>
            )}
            {!sportsError && sports.length === 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                No active sports are available. Add a sport first to create a tournament.
              </Alert>
            )}
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
              }}
            >
              <Box>
                <TextField
                  label="Tournament Name"
                  fullWidth
                  {...register("name", {
                    required: "Tournament name is required.",
                    minLength: { value: 3, message: "Enter a valid tournament name." },
                  })}
                  error={Boolean(errors.name)}
                  helperText={errors.name?.message}
                />
              </Box>

              <Box>
                <Controller
                  name="sport"
                  control={control}
                  rules={{ required: "Select a sport." }}
                  render={({ field }) => (
                    <TextField
                      label="Sport"
                      select
                      fullWidth
                      {...field}
                      error={Boolean(errors.sport)}
                      helperText={errors.sport?.message}
                    >
                      {sports.map((sport) => (
                        <MenuItem key={sport.id} value={sport.name}>
                          {sport.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Box>

              <Box>
                <Controller
                  name="type"
                  control={control}
                  rules={{ required: "Tournament type is required." }}
                  render={({ field }) => (
                    <TextField
                      label="Tournament Type"
                      select
                      fullWidth
                      {...field}
                      error={Boolean(errors.type)}
                      helperText={errors.type?.message}
                    >
                      {TOURNAMENT_TYPES.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Box>

              <Box>
                <TextField
                  label="Location"
                  fullWidth
                  {...register("location", {
                    required: "Location is required.",
                  })}
                  error={Boolean(errors.location)}
                  helperText={errors.location?.message}
                />
              </Box>

              <Box>
                <Controller
                  name="startDate"
                  control={control}
                  rules={{ required: "Start date is required." }}
                  render={({ field }) => (
                    <TextField
                      label="Start Date"
                      type="date"
                      fullWidth
                      variant="outlined"
                      slotProps={{
                        inputLabel: {
                          shrink: true,
                          sx: { transform: 'translate(14px, -6px) scale(0.75)' },
                        },
                        htmlInput: {
                          sx: {
                            paddingTop: '18px',
                          },
                        },
                      }}
                      {...field}
                      error={Boolean(errors.startDate)}
                      helperText={errors.startDate?.message}
                    />
                  )}
                />
              </Box>

              <Box>
                <Controller
                  name="endDate"
                  control={control}
                  rules={{
                    required: "End date is required.",
                    validate: (value) =>
                      !watchStartDate || new Date(value) >= new Date(watchStartDate) ||
                      "End date must be the same day or after start date.",
                  }}
                  render={({ field }) => (
                    <TextField
                      label="End Date"
                      type="date"
                      fullWidth
                      variant="outlined"
                      slotProps={{
                        inputLabel: {
                          shrink: true,
                          sx: { transform: 'translate(14px, -6px) scale(0.75)' },
                        },
                        htmlInput: {
                          sx: {
                            paddingTop: '18px',
                          },
                        },
                      }}
                      {...field}
                      error={Boolean(errors.endDate)}
                      helperText={errors.endDate?.message}
                    />
                  )}
                />
              </Box>

              <Box>
                <Controller
                  name="registrationStartDate"
                  control={control}
                  rules={{
                    required: "Registration start date is required.",
                    validate: (value) =>
                      !watchStartDate ||
                      new Date(value) <= new Date(watchStartDate) ||
                      "Registration must start on or before tournament start.",
                  }}
                  render={({ field }) => (
                    <TextField
                      label="Registration Start"
                      type="date"
                      fullWidth
                      variant="outlined"
                      slotProps={{
                        inputLabel: {
                          shrink: true,
                          sx: { transform: 'translate(14px, -6px) scale(0.75)' },
                        },
                        htmlInput: {
                          sx: {
                            paddingTop: '18px',
                          },
                        },
                      }}
                      {...field}
                      error={Boolean(errors.registrationStartDate)}
                      helperText={errors.registrationStartDate?.message}
                    />
                  )}
                />
              </Box>

              <Box>
                <Controller
                  name="registrationEndDate"
                  control={control}
                  rules={{
                    required: "Registration end date is required.",
                    validate: (value) => {
                      if (watchRegistrationStartDate && new Date(value) < new Date(watchRegistrationStartDate)) {
                        return "Registration end date must be on or after registration start.";
                      }
                      if (watchEndDate && new Date(value) > new Date(watchEndDate)) {
                        return "Registration end date must be on or before tournament end.";
                      }
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      label="Registration End"
                      type="date"
                      fullWidth
                      variant="outlined"
                      slotProps={{
                        inputLabel: {
                          shrink: true,
                          sx: { transform: 'translate(14px, -6px) scale(0.75)' },
                        },
                        htmlInput: {
                          sx: {
                            paddingTop: '18px',
                          },
                        },
                      }}
                      {...field}
                      error={Boolean(errors.registrationEndDate)}
                      helperText={errors.registrationEndDate?.message}
                    />
                  )}
                />
              </Box>

              <Box>
                <TextField
                  label="Organizer"
                  fullWidth
                  {...register("organizer", {
                    required: "Organizer is required.",
                  })}
                  error={Boolean(errors.organizer)}
                  helperText={errors.organizer?.message}
                />
              </Box>

              <Box>
                <Controller
                  name="status"
                  control={control}
                  rules={{ required: "Tournament status is required." }}
                  render={({ field }) => (
                    <TextField
                      label="Status"
                      select
                      fullWidth
                      {...field}
                      error={Boolean(errors.status)}
                      helperText={errors.status?.message}
                    >
                      {TOURNAMENT_STATUSES.map((status) => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Box>

              <Box>
                <TextField
                  label="Max Teams / Players"
                  type="number"
                  fullWidth
                  inputProps={{ min: 1 }}
                  {...register("maxParticipants", {
                    required: "Maximum participants is required.",
                    valueAsNumber: true,
                    validate: (value) =>
                      value > 0 || "Enter a valid maximum number of teams or players.",
                  })}
                  error={Boolean(errors.maxParticipants)}
                  helperText={errors.maxParticipants?.message}
                />
              </Box>

              <Box sx={{ gridColumn: { xs: "span 1", md: "span 2" } }}>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  minRows={4}
                  {...register("description", {
                    maxLength: {
                      value: 500,
                      message: "Description cannot exceed 500 characters.",
                    },
                  })}
                  error={Boolean(errors.description)}
                  helperText={errors.description?.message}
                />
              </Box>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
              <Button variant="outlined" onClick={() => navigate("/admin/tournaments")}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting || (!sportsError && sports.length === 0)}
              >
                {isEditMode ? "Save Changes" : "Create Tournament"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

export default TournamentForm;
