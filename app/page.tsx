import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dumbbell, TrendingUp, Calendar, BarChart3 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Dumbbell className="h-16 w-16 text-blue-600 mr-4" />
            <h1 className="text-6xl font-bold text-gray-900 dark:text-white">GymTrack</h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Sistema completo para gerenciar seus exercícios, criar fichas de treino personalizadas e acompanhar seu
            progresso fitness
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-600">
            <CardHeader className="text-center">
              <Dumbbell className="h-10 w-10 text-blue-600 mx-auto mb-3" />
              <CardTitle className="text-xl">Exercícios</CardTitle>
              <CardDescription>Cadastre e organize sua biblioteca de exercícios por grupo muscular</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/exercises">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Gerenciar Exercícios</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-600">
            <CardHeader className="text-center">
              <Calendar className="h-10 w-10 text-green-600 mx-auto mb-3" />
              <CardTitle className="text-xl">Fichas de Treino</CardTitle>
              <CardDescription>Monte fichas personalizadas com séries, repetições e cargas</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/workouts">
                <Button className="w-full bg-green-600 hover:bg-green-700">Criar Fichas</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-600">
            <CardHeader className="text-center">
              <TrendingUp className="h-10 w-10 text-purple-600 mx-auto mb-3" />
              <CardTitle className="text-xl">Progresso</CardTitle>
              <CardDescription>Registre seus treinos e atualize cargas em tempo real</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/progress">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">Registrar Treino</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-orange-600">
            <CardHeader className="text-center">
              <BarChart3 className="h-10 w-10 text-orange-600 mx-auto mb-3" />
              <CardTitle className="text-xl">Histórico</CardTitle>
              <CardDescription>Acompanhe sua evolução e estatísticas de treino</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/history">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">Ver Evolução</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center bg-white/80 backdrop-blur rounded-lg p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Como começar?</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-2">
                1
              </div>
              <p className="font-medium">Cadastre exercícios</p>
              <p className="text-gray-600">Monte sua biblioteca</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mb-2">
                2
              </div>
              <p className="font-medium">Crie fichas de treino</p>
              <p className="text-gray-600">Organize seus treinos</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mb-2">
                3
              </div>
              <p className="font-medium">Registre seu progresso</p>
              <p className="text-gray-600">Acompanhe sua evolução</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
