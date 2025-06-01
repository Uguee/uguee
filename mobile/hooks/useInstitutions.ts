import { useEffect, useState } from "react";
import { getInstitutions } from "../services/institutionService";

export function useInstitutions() {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getInstitutions()
      .then((data) => setInstitutions(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { institutions, loading, error };
}
