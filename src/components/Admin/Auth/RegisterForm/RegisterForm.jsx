import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import "./RegisterForm.scss";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const validationSchema = Yup.object({
  firstname: Yup.string().trim().required("El nombre es obligatorio"),
  lastname: Yup.string().trim().required("El apellido es obligatorio"),
  email: Yup.string()
    .trim()
    .email("Correo inválido")
    .required("El correo es obligatorio"),
  password: Yup.string()
    .min(6, "Mínimo 6 caracteres")
    .required("La contraseña es obligatoria"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Las contraseñas no coinciden")
    .required("Confirma tu contraseña"),
});

const getPasswordStrength = (password) => {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password) && password.length >= 10) score++;
  return Math.min(score, 3);
};

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState(null);

  const formik = useFormik({
    initialValues: {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setServerMessage(null);
      setLoading(true);

      try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstname: values.firstname,
            lastname: values.lastname,
            email: values.email,
            password: values.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.msg || "Ocurrió un error, intenta de nuevo");
        }

        setServerMessage({
          type: "success",
          text: "Cuenta creada correctamente. Un administrador debe activarla antes de que puedas iniciar sesión.",
        });

        resetForm();
      } catch (err) {
        setServerMessage({ type: "error", text: err.message });
      } finally {
        setLoading(false);
      }
    },
  });

  const passwordStrength = getPasswordStrength(formik.values.password);
  const strengthLabel = ["", "Débil", "Media", "Fuerte"][passwordStrength];
  const strengthClass = ["", "filled-weak", "filled-medium", "filled-strong"][passwordStrength];

  return (
    <div className="register-form">
      <div className="register-form__header">
        <h2>Crear cuenta</h2>
        <p>Completa tus datos para registrarte</p>
      </div>

      <form onSubmit={formik.handleSubmit} noValidate>
        <div className="register-field">
          <label htmlFor="firstname">Nombre</label>
          <input
            type="text"
            id="firstname"
            name="firstname"
            value={formik.values.firstname}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={
              formik.touched.firstname && formik.errors.firstname ? "input-error" : ""
            }
            placeholder="Tu nombre"
            autoComplete="given-name"
          />
          {formik.touched.firstname && formik.errors.firstname && (
            <span className="field-error">{formik.errors.firstname}</span>
          )}
        </div>

        <div className="register-field">
          <label htmlFor="lastname">Apellido</label>
          <input
            type="text"
            id="lastname"
            name="lastname"
            value={formik.values.lastname}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={
              formik.touched.lastname && formik.errors.lastname ? "input-error" : ""
            }
            placeholder="Tu apellido"
            autoComplete="family-name"
          />
          {formik.touched.lastname && formik.errors.lastname && (
            <span className="field-error">{formik.errors.lastname}</span>
          )}
        </div>

        <div className="register-field">
          <label htmlFor="email">Correo electrónico</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={
              formik.touched.email && formik.errors.email ? "input-error" : ""
            }
            placeholder="tucorreo@ejemplo.com"
            autoComplete="email"
          />
          {formik.touched.email && formik.errors.email && (
            <span className="field-error">{formik.errors.email}</span>
          )}
        </div>

        <div className="register-field">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={
              formik.touched.password && formik.errors.password ? "input-error" : ""
            }
            placeholder="••••••••"
            autoComplete="new-password"
          />

          {formik.values.password && (
            <>
              <div className="register-password-strength">
                {[1, 2, 3].map((level) => (
                  <span
                    key={level}
                    className={level <= passwordStrength ? strengthClass : ""}
                  />
                ))}
              </div>
              <span className="register-strength-label">
                Seguridad: {strengthLabel}
              </span>
            </>
          )}

          {formik.touched.password && formik.errors.password && (
            <span className="field-error">{formik.errors.password}</span>
          )}
        </div>

        <div className="register-field">
          <label htmlFor="confirmPassword">Confirmar contraseña</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={
              formik.touched.confirmPassword && formik.errors.confirmPassword
                ? "input-error"
                : ""
            }
            placeholder="••••••••"
            autoComplete="new-password"
          />
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <span className="field-error">{formik.errors.confirmPassword}</span>
          )}
        </div>

        {serverMessage && (
          <p className={`register-form__message ${serverMessage.type}`}>
            {serverMessage.text}
          </p>
        )}

        <button type="submit" className="register-submit" disabled={loading}>
          {loading ? "Creando cuenta..." : "Registrarme"}
        </button>
      </form>
    </div>
  );
}