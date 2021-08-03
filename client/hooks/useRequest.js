import { useState } from "react";
import axios from "axios";

const useRequest = ({ url, method, body, onSuccess }) => {
  const [errors, setErrors] = useState(null);

  const doRequest = async (props = {}) => {
    try {
      setErrors(null);
      const response = await axios[method](url, { ...body, ...props });
      if (onSuccess) onSuccess(response.data);
      return response.data;
    } catch (error) {
      const { errors } = error.response.data;
      setErrors(
        <div className="alert alert-danger">
          <h4>Ooops....</h4>

          <ul>
            {errors.map((err) => (
              <li key={err.message}>{err.message}</li>
            ))}
          </ul>
        </div>
      );
    }
  };

  return { doRequest, errors };
};

export default useRequest;
