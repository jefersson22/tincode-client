import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import "./LoginForm.scss";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const validationSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Correo inválido")
    .required("El correo es obligatorio"),
  password: Yup.string().required("La contraseña es obligatoria"),
});

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState(null);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setServerMessage(null);
      setLoading(true);

      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.msg || "Credenciales inválidas");
        }

        localStorage.setItem("accessToken", data.access);
        localStorage.setItem("refreshToken", data.refresh);

        setServerMessage({ type: "success", text: "Inicio de sesión correcto." });
      } catch (err) {
        setServerMessage({ type: "error", text: err.message });
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="login-form">
      <div className="login-form__header">
        <h2>Iniciar sesión</h2>
        <p>Ingresa tus credenciales para continuar</p>
      </div>

      <form onSubmit={formik.handleSubmit} noValidate>
        <div className="login-field">
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

        <div className="login-field">
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
            autoComplete="current-password"
          />
          {formik.touched.password && formik.errors.password && (
            <span className="field-error">{formik.errors.password}</span>
          )}
        </div>

        <div className="login-form__options">
          <a href="/recuperar-contrasena">¿Olvidaste tu contraseña?</a>
        </div>

        {serverMessage && (
          <p className={`login-form__message ${serverMessage.type}`}>
            {serverMessage.text}
          </p>
        )}

        <button type="submit" className="login-submit" disabled={loading}>
          {loading ? "Procesando..." : "Iniciar sesión"}
        </button>
      </form>
    </div>
  );
}