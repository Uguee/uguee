import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { ReviewService, type TripReviewsResponse } from '@/services/reviewService';

// src/components/reviews/TripReviews.tsx
interface Review {
    id_resena: number;
    calificacion: number;
    descripcion: string;
    id_viaje: number;
  }
  
  interface TripReviewsProps {
    id_viaje: number;
  }
  
  export const TripReviews = ({ id_viaje }: TripReviewsProps) => {
    const [reviews, setReviews] = useState<TripReviewsResponse | null>(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchReviews = async () => {
        try {
          const data = await ReviewService.getTripReviews(id_viaje);
          setReviews(data);
        } catch (error) {
          console.error('Error fetching reviews:', error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchReviews();
    }, [id_viaje]);
  
    const renderStars = (rating: number) => {
      return (
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={`star-${star}`}
              className={`w-5 h-5 ${
                star <= rating
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      );
    };
  
    if (loading) {
      return (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }
  
    if (!reviews) {
      return (
        <div className="text-center text-gray-500 p-4">
          No se pudieron cargar las reseñas
        </div>
      );
    }
  
    return (
      <div className="space-y-4">
        {/* Promedio y total */}
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
          <div className="flex items-center">
            {renderStars(reviews.promedio)}
          </div>
          <div>
            <span className="text-2xl font-bold">{reviews.promedio.toFixed(1)}</span>
            <span className="text-gray-500 ml-2">
              ({reviews.total_resenas} {reviews.total_resenas === 1 ? 'reseña' : 'reseñas'})
            </span>
          </div>
        </div>
  
        {/* Lista de reseñas */}
        <div className="space-y-4">
          {reviews.resenas.map((review) => (
            <div key={review.id_resena} className="p-4 bg-white rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    {renderStars(review.calificacion)}
                    <span className="font-medium">
                      Calificación: {review.calificacion}/5
                    </span>
                  </div>
                  {review.descripcion && (
                    <p className="mt-2 text-gray-600">{review.descripcion}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };