
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import WorkflowEditor from '../../components/WorkflowEditor'

export default function WorkflowPage() {
  const router = useRouter()
  const { id } = router.query
  
  return (
    <Layout>
      <WorkflowEditor id={id as string} />
    </Layout>
  )
}
