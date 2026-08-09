import { useEffect, useState } from "react";
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
import { useForm, Controller } from "react-hook-form";
import DashboardLayout from "../../components/layout/Navbar";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import {
  createSport,
  getSport,
  updateSport,
} from "../../services/sportService";
import { useAuth } from "../../hooks/useAuth";

const sportTypes = [
  { id: "team", label: "Team" },
  { id: "individual", label: "Individual" },
];

function SportForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEditMode);
  const [submitError, setSubmitError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const { isAuthenticated, loading: authLoading } = useAuth();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      type: "team",
      active: true,
    },
  });

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    async function loadSport() {
      setLoading(true);
      setSubmitError(null);

      try {
        const sport = await getSport(id);
        if (!sport) {
          setSubmitError("Sport not found.");
          return;
        }

        reset({
          name: sport.name || "",
          type: sport.type || "team",
          active: sport.active ?? true,
        });
      } catch (error) {
        console.error(error);
        setSubmitError("Unable to load sport details. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadSport();
  }, [id, isEditMode, reset]);

  const onSubmit = async (data) => {
    setSubmitError(null);
    setSuccessMessage("");

    if (!isAuthenticated) {
      setSubmitError("Please sign in to add or update sports.");
      return;
    }

    try {
      if (isEditMode) {
        await updateSport(id, data);
        setSuccessMessage("Sport updated successfully.");
      } else {
        await createSport(data);
        // After creating a sport, return to the list so it reloads and shows the new sport.
        navigate("/admin/sports");
      }
    } catch (err) {
      console.error("Sport save error:", err);
      if (err?.code === "permission-denied") {
        setSubmitError(
          "Unable to save sport due to Firestore permissions. Verify your Firebase security rules and authenticated user access."
        );
      } else {
        setSubmitError("Unable to save sport. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loader message="Loading sport details..." />
      </DashboardLayout>
    );
  }

  if (authLoading) {
    return (
      <DashboardLayout>
        <Loader message="Checking authentication..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title={isEditMode ? "Edit Sport" : "Add Sport"}
        subtitle={
          isEditMode
            ? "Update sport details and availability."
            : "Create a new sport for tournament selection."
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
            <Box sx={{ display: "grid", gap: 2, maxWidth: 560 }}>
              <TextField
                label="Sport Name"
                fullWidth
                {...register("name", {
                  required: "Sport name is required.",
                  minLength: { value: 3, message: "Enter a valid sport name." },
                })}
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
              />

              <Controller
                name="type"
                control={control}
                rules={{ required: "Sport type is required." }}
                render={({ field }) => (
                  <TextField
                    label="Sport Type"
                    select
                    fullWidth
                    {...field}
                    error={Boolean(errors.type)}
                    helperText={errors.type?.message}
                  >
                    {sportTypes.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />

              <Controller
                name="active"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Status"
                    select
                    fullWidth
                    {...field}
                  >
                    <MenuItem value={true}>Active</MenuItem>
                    <MenuItem value={false}>Inactive</MenuItem>
                  </TextField>
                )}
              />

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/admin/sports")}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  {isEditMode ? "Save Changes" : "Add Sport"}
                </Button>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

export default SportForm;
