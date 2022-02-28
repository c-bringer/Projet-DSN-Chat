package fr.limayrac.projetdsnchatandroid

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.navigation.fragment.findNavController
import fr.limayrac.projetdsnchatandroid.databinding.FragmentResetPasswordBinding

/**
 * A simple [Fragment] subclass as the second destination in the navigation.
 */
class ResetPasswordFragment : Fragment() {

    private var _binding: FragmentResetPasswordBinding? = null

    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {

        _binding = FragmentResetPasswordBinding.inflate(inflater, container, false)
        return binding.root

    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.buttonConnexion.setOnClickListener {
            findNavController().navigate(R.id.action_resetPasswordFragment_to_Login)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}