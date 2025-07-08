'use client';

import Image from "next/image";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';


export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="flex justify-between items-center p-4 shadow-md">
        <img src='/LogoGraditude.svg' alt="Graditude" />
        <button className="bg-green-500 text-white px-4 py-2 rounded-lg w-[180px] h-[40px]" onClick={() => router.push('/login')}>Войти</button>
      </header>

      <section className="flex flex-col md:flex-row items-center py-12 px-[295px]">
      {/* Текстовая часть */}
      <div className="w-full md:w-1/2">
        <div className="max-w-[550px]">
          <h2 className="text-3xl font-bold font-inter">
            Добро пожаловать на Graditude – это портал, где начинается путь к успешной сдаче курсовой или дипломной работы!
          </h2>
        </div>
        <div className="max-w-[600px]">
          <p className="text-xl mt-4 text-gray-500 font-inter font-medium">
            Этот ресурс создан специально для студентов и кураторов, которым важна грамотная и эффективная подготовка научных проектов.
          </p>
        </div>
        <div className="flex justify-center">
          <button
            className="mt-6 bg-red-400 text-white w-[317px] h-[54px] rounded-md font-medium text-lg"
            onClick={() => router.push('/register')}
          >
            Создать учетную запись
          </button>
        </div>    
      </div>
      {/* Изображение */}
      <div className="w-full md:w-1/2 flex justify-center md:justify-end mt-8 md:mt-0">
        <img src="/firstImg.svg" alt="Hero Image" width="482" height="482" />
      </div>
    </section>

    <section className="flex flex-col md:flex-row items-center px-[295px]">
      <p className="text-xl font-inter text-gray-700 font-semibold">Выбор темы научной работы – один из важнейших этапов в учебном процессе, и данный сайт поможет сделать его как можно проще.  Благодаря чутко продуманной стратегии написания научной работы, исходя из анализа академических новшеств и актуальных исследований, вам предлагается система взаимодействия, которая эффективна для кураторов и студентов.</p>
    </section>

      {/* Benefits for Curators */}
      <section className="flex flex-col md:flex-row items-center py-12 px-[30px] max-w-[1240px] mx-auto h-[460px]">
        {/* Изображение слева */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-start">
          <img src="/secondImg.svg" alt="Hero Image" width="420px" height="428.96px" />
        </div>

        {/* Текстовая часть справа */}
        <div className="w-full md:w-1/2 flex flex-col justify-center max-w-[550px]">
          <h3 className="text-4xl font-bold font-inter">
            Gratitude помогает кураторам:
          </h3>
          <ul className="mt-4 text-black-500 font-inter text-xl font-medium">
            <li className="flex items-start mb-5">
              <img src="checkMark.svg" alt="" width="22px" height="15.64px" className="relative top-1 -translate-x-2"/>
              <span>
                Взаимодействовать со студентами посредством комментирования, отправленных отчетов, предлагая идеи, советы и конструктивную обратную связь.
              </span>
            </li>
            <li className="flex items-start mb-5">
              <img src="checkMark.svg" alt="" width="22px" height="15.64px" className="relative top-1 -translate-x-2"/>
              <span>
                Быстро предлагать подходящие темы, экономя время на согласование и подбор.
              </span>
            </li>
            <li className="flex items-start">
              <img src="checkMark.svg" alt="" width="22px" height="15.64px" className="relative top-1 -translate-x-2"/>
              <span>
                Оптимизировать работу – используйте инструменты для эффективного управления проектами студентов, сортируйте студентов и их работы с помощью предложенных фильтраций.
              </span>
            </li>
          </ul>
        </div>
      </section>


      {/* Benefits for Students */}
      <section className="flex flex-col md:flex-row md:gap-x-12 items-center py-12 px-[10px] max-w-[1240px] mx-auto h-[460px]">

        {/* Текстовая часть слева */}
        <div className="w-full md:w-1/2 flex flex-col justify-center max-w-[550px]">
          <h3 className="text-4xl font-bold font-inter">
            Gratitude помогает студентам:
          </h3>
          <ul className="mt-4 text-black-500 font-inter text-xl font-medium">
            <li className="flex items-start mb-5">
              <img src="checkMark.svg" alt="" width="22px" height="15.64px" className="relative top-1 -translate-x-2"/>
              <span>
                Подобрать актуальные темы –  просматривайте список тем, рекомендуемые кураторами.
              </span>
            </li>
            <li className="flex items-start mb-5">
              <img src="checkMark.svg" alt="" width="22px" height="15.64px" className="relative top-1 -translate-x-2"/>
              <span>
                Получить обратную связь – общайтесь с кураторами, задавайте вопросы и получайте советы по улучшению своих идей и проектов.
              </span>
            </li>
            <li className="flex items-start">
              <img src="checkMark.svg" alt="" width="22px" height="15.64px" className="relative top-1 -translate-x-2"/>
              <span>
                Отслеживать свой прогресс – ведите учет своих успехов и этапов выполнения работы, чтобы оставаться на правильном пути к успешной защите.
              </span>
            </li>
          </ul>
        </div>

        {/* Изображение справа */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-start">
          <img src="/thirdImg.svg" alt="Hero Image" width="420px" height="420px" />
        </div>
      </section>

      {/* Partners */}
      <section className="text-center py-12">
        <h3 className="text-3xl font-bold">С нами сотрудничают лучшие ВУЗы страны</h3>
        <div className="max-w mx-auto mt-10 overflow-hidden">
          <Swiper
            modules={[Autoplay, FreeMode]}
            spaceBetween={5}
            slidesPerView={3}
            loop={true}
            speed={5000}
            freeMode={true}
            autoplay={{
              delay: 0,
              disableOnInteraction: false,
              waitForTransition: true,
            }}
            breakpoints={{
              640: {
                slidesPerView: 3,
                spaceBetween: 10,
              },
              768: {
                slidesPerView: 4,
                spaceBetween: 10,
              },
              1024: {
                slidesPerView: 5,
                spaceBetween: 10,
              },
            }}
          >
            <SwiperSlide>
              <Image src="/mgu.png" width={100} height={98.71} alt="University 1" />
            </SwiperSlide>
            <SwiperSlide>
              <Image src="/shgpu.png" width={104} height={123.5} alt="University 2" />
            </SwiperSlide>
            <SwiperSlide>
              <Image src="/tgu.png" width={123} height={132} alt="University 3" />
            </SwiperSlide>
            <SwiperSlide>
              <Image src="/itmo.png" width={100} height={100} alt="University 4" />
            </SwiperSlide>
            <SwiperSlide>
              <Image src="/smth.png" width={89} height={115.12} alt="University 5" />
            </SwiperSlide>
            <SwiperSlide>
              <Image src="/spbgu.png" width={100} height={113.23} alt="University 6" />
            </SwiperSlide>
            <SwiperSlide>
              <Image src="/kgu.png" width={105} height={106.17} alt="University 7" />
            </SwiperSlide>
          </Swiper>
        </div>
      </section>


      {/* Call to Action */}
      <section className="text-center py-12 bg-gradient-to-br from-green-100 via-orange-50 to-green-100">
        <h3 className="text-3xl font-bold">До сих пор остались сомнения?</h3>
        <p className="text-xl mt-4 text-gray-700">Инструменты для продуктивной учебы уже ждут тебя! Общение, планирование и помощь - всё в одном месте!</p>
        <p className="text-xl mt-4 text-gray-700">Присоединяйся к нам прямо сейчас!</p>
        <button className="mt-6 bg-green-500 text-white px-6 py-3 rounded-lg font-medium" onClick={() => router.push('/register')}>
          Присоединиться
        </button>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-600">
        <Link href="#" className="hover:text-gray-950 hover:scale-105 transition-all duration-300">Безопасность </Link> 
        | 
        <Link href="#" className="hover:text-gray-950 hover:scale-105 transition-all duration-300"> Конфиденциальность </Link> 
        | 
        <Link href="#" className="hover:text-gray-950 hover:scale-105 transition-all duration-300"> Условия </Link>
      </footer>

    </div>
  );
}
